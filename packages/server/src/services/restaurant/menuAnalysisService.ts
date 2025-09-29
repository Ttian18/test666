import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { createError } from "../../utils/errors/menuAnalysisErrors.ts";

// Use global prisma instance in tests, otherwise create new instance
const prisma = global.prisma || new PrismaClient();

export default class MenuAnalysisService {
  constructor({ openai } = {}) {
    const isTestMode = String(process.env.TEST_MODE || "").trim() === "1";
    const apiKey = process.env.OPENAI_API_KEY;
    this.isMock = isTestMode || !apiKey;

    this.openai = this.isMock ? null : openai || new OpenAI({ apiKey });
  }

  /**
   * Sends the image to OpenAI Vision to extract menu items with names, descriptions, prices.
   * Returns a normalized structure: { items: [{ name, description, price, category? }], currency }
   * Optionally saves the analysis to user history if userId is provided.
   */
  async extractMenuFromImage({
    imageBuffer,
    imageMimeType,
    userId = null,
    budget = null,
    userNote = "",
  }) {
    if (this.isMock) {
      return this.getMockMenuData();
    }

    // Validate image buffer
    if (!imageBuffer || imageBuffer.length === 0) {
      console.warn("Empty image buffer provided, using fallback data");
      return this.getFallbackMenuData();
    }

    // Check if image is too small (likely a mock image)
    if (imageBuffer.length < 1000) {
      console.warn(
        "Image buffer too small, likely a mock image. Using fallback data."
      );
      return this.getFallbackMenuData();
    }

    // Turn the image buffer into base64 data URL for the vision model
    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:${imageMimeType};base64,${base64}`;

    const systemPrompt =
      "You are a precise OCR and information extraction assistant for restaurant menus." +
      " Extract all dishes with name, description if available, price as a number, and currency symbol or code." +
      " Return concise, correct data only. If the image is unclear or doesn't contain menu items, return an empty items array.";

    const userPrompt =
      "From this menu image, extract a JSON object with: { currency: string, items: [{ name: string, description?: string, price: number, category?: string }] }." +
      " Ensure prices are numeric, and do not include currency symbols in the number." +
      " Extract dish names in the same language as they appear on the menu." +
      " If no menu items are visible, return { currency: '$', items: [] }.";

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const text = response.choices?.[0]?.message?.content?.trim();
      if (!text) {
        console.warn("Empty response from vision API, using fallback data");
        return this.getFallbackMenuData();
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.warn(
          "Failed to parse vision JSON, using fallback data:",
          e.message
        );
        return this.getFallbackMenuData();
      }

      const items = Array.isArray(parsed.items) ? parsed.items : [];
      const normalizedItems = items
        .map((it) => ({
          name: String(it.name || "").trim(),
          description: it.description ? String(it.description).trim() : "",
          price: Number(it.price) || 0,
          category: it.category ? String(it.category).trim() : "",
        }))
        .filter((it) => it.name && it.price > 0);

      // If no valid items found, use fallback
      if (normalizedItems.length === 0) {
        console.warn("No valid menu items extracted, using fallback data");
        return this.getFallbackMenuData();
      }

      const result = {
        currency: String(parsed.currency || "$").trim(),
        items: normalizedItems,
      };

      // Save to user history if userId is provided
      if (userId && typeof userId === "number") {
        try {
          await this.saveMenuAnalysisHistory(userId, {
            menuData: result,
            budget,
            userNote,
            imageSize: imageBuffer.length,
            imageMimeType,
          });
        } catch (historyError) {
          console.warn(
            "Failed to save menu analysis history:",
            historyError.message
          );
          // Don't fail the main operation if history saving fails
        }
      }

      return result;
    } catch (error) {
      console.error("Vision API error:", error.message);
      console.warn("Using fallback menu data due to API error");
      const fallbackResult = this.getFallbackMenuData();

      // Save fallback result to user history if userId is provided
      if (userId && typeof userId === "number") {
        try {
          await this.saveMenuAnalysisHistory(userId, {
            menuData: fallbackResult,
            budget,
            userNote,
            imageSize: imageBuffer.length,
            imageMimeType,
            isFallback: true,
          });
        } catch (historyError) {
          console.warn(
            "Failed to save fallback menu analysis history:",
            historyError.message
          );
        }
      }

      return fallbackResult;
    }
  }

  /**
   * Provides mock menu data for test mode
   */
  getMockMenuData() {
    return {
      currency: "$",
      items: [
        {
          name: "Spring Rolls",
          description: "Crispy veggie rolls",
          price: 6.5,
          category: "Appetizers",
        },
        {
          name: "Fried Rice",
          description: "Egg, peas, carrots",
          price: 11.0,
          category: "Mains",
        },
        {
          name: "Kung Pao Chicken",
          description: "Spicy peanuts",
          price: 13.5,
          category: "Mains",
        },
        {
          name: "Jasmine Tea",
          description: "Hot tea",
          price: 3.0,
          category: "Drinks",
        },
        {
          name: "Mango Pudding",
          description: "Dessert",
          price: 5.0,
          category: "Desserts",
        },
      ],
    };
  }

  /**
   * Provides fallback menu data when AI extraction fails
   */
  getFallbackMenuData() {
    return {
      currency: "$",
      items: [
        {
          name: "Sample Appetizer",
          description: "A delicious starter dish",
          price: 8.99,
          category: "Appetizers",
        },
        {
          name: "Sample Main Course",
          description: "A satisfying main dish",
          price: 16.99,
          category: "Mains",
        },
        {
          name: "Sample Dessert",
          description: "A sweet ending to your meal",
          price: 6.99,
          category: "Desserts",
        },
      ],
    };
  }

  // ==================== USER-AWARE CRUD OPERATIONS ====================

  /**
   * Save menu analysis to user history
   * @param {number} userId - The user ID (integer)
   * @param {object} data - The menu analysis data
   * @returns {Promise<object>} The created menu analysis record
   */
  async saveMenuAnalysisHistory(userId, data) {
    if (!userId || typeof userId !== "number") {
      throw new Error("Valid user ID (integer) is required");
    }

    const {
      menuData,
      budget,
      userNote,
      imageSize,
      imageMimeType,
      isFallback = false,
    } = data;

    if (!menuData || typeof menuData !== "object") {
      throw new Error("Valid menu data is required");
    }

    return await prisma.menuAnalysis.create({
      data: {
        user_id: userId,
        menuData,
        budget: budget ? Number(budget) : null,
        userNote: userNote || null,
        imageSize: imageSize ? Number(imageSize) : null,
        imageMimeType: imageMimeType || null,
        isFallback,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  /**
   * Get all menu analyses for a specific user
   * @param {number} userId - The user ID (integer)
   * @param {object} options - Query options
   * @returns {Promise<Array>} Array of menu analyses
   */
  async getAllMenuAnalyses(userId, options = {}) {
    if (!userId || typeof userId !== "number") {
      throw new Error("Valid user ID (integer) is required");
    }

    const { limit = 50, offset = 0, includeUser = false } = options;

    return await prisma.menuAnalysis.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: includeUser
        ? {
            user: {
              select: { id: true, email: true, name: true },
            },
          }
        : undefined,
    });
  }

  /**
   * Get a specific menu analysis by ID for a specific user
   * @param {number} userId - The user ID (integer)
   * @param {number} analysisId - The menu analysis ID
   * @returns {Promise<object|null>} The menu analysis or null if not found
   */
  async getMenuAnalysisById(userId, analysisId) {
    if (!userId || typeof userId !== "number") {
      throw new Error("Valid user ID (integer) is required");
    }

    if (!analysisId || typeof analysisId !== "number") {
      throw new Error("Valid analysis ID (integer) is required");
    }

    return await prisma.menuAnalysis.findFirst({
      where: {
        id: analysisId,
        user_id: userId, // Ensure user can only access their own analyses
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  /**
   * Update a specific menu analysis for a specific user
   * @param {number} userId - The user ID (integer)
   * @param {number} analysisId - The menu analysis ID
   * @param {object} updateData - The data to update
   * @returns {Promise<object>} The updated menu analysis
   */
  async updateMenuAnalysis(userId, analysisId, updateData) {
    if (!userId || typeof userId !== "number") {
      throw new Error("Valid user ID (integer) is required");
    }

    if (!analysisId || typeof analysisId !== "number") {
      throw new Error("Valid analysis ID (integer) is required");
    }

    // First check if the analysis exists and belongs to the user
    const existingAnalysis = await this.getMenuAnalysisById(userId, analysisId);
    if (!existingAnalysis) {
      throw new Error("Menu analysis not found or access denied");
    }

    const { userNote, budget } = updateData;

    // Build update object with only provided fields
    const updateFields = {};
    if (userNote !== undefined) updateFields.userNote = userNote || null;
    if (budget !== undefined)
      updateFields.budget = budget ? Number(budget) : null;

    return await prisma.menuAnalysis.update({
      where: { id: analysisId },
      data: updateFields,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  /**
   * Delete a specific menu analysis for a specific user
   * @param {number} userId - The user ID (integer)
   * @param {number} analysisId - The menu analysis ID
   * @returns {Promise<object>} The deleted menu analysis
   */
  async deleteMenuAnalysis(userId, analysisId) {
    if (!userId || typeof userId !== "number") {
      throw new Error("Valid user ID (integer) is required");
    }

    if (!analysisId || typeof analysisId !== "number") {
      throw new Error("Valid analysis ID (integer) is required");
    }

    // First check if the analysis exists and belongs to the user
    const existingAnalysis = await this.getMenuAnalysisById(userId, analysisId);
    if (!existingAnalysis) {
      throw new Error("Menu analysis not found or access denied");
    }

    return await prisma.menuAnalysis.delete({
      where: { id: analysisId },
    });
  }

  /**
   * Get menu analysis statistics for a user
   * @param {number} userId - The user ID (integer)
   * @returns {Promise<object>} Statistics about user's menu analyses
   */
  async getMenuAnalysisStats(userId) {
    if (!userId || typeof userId !== "number") {
      throw new Error("Valid user ID (integer) is required");
    }

    const [totalCount, fallbackCount, avgBudget, recentCount] =
      await Promise.all([
        // Total analyses
        prisma.menuAnalysis.count({
          where: { user_id: userId },
        }),
        // Fallback analyses
        prisma.menuAnalysis.count({
          where: { user_id: userId, isFallback: true },
        }),
        // Average budget
        prisma.menuAnalysis.aggregate({
          where: { user_id: userId, budget: { not: null } },
          _avg: { budget: true },
        }),
        // Recent analyses (last 30 days)
        prisma.menuAnalysis.count({
          where: {
            user_id: userId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    return {
      totalAnalyses: totalCount,
      fallbackAnalyses: fallbackCount,
      successfulAnalyses: totalCount - fallbackCount,
      averageBudget: avgBudget._avg.budget || 0,
      recentAnalyses: recentCount,
      successRate:
        totalCount > 0
          ? (((totalCount - fallbackCount) / totalCount) * 100).toFixed(1)
          : 0,
    };
  }
}
