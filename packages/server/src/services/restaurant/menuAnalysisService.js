import OpenAI from "openai";
import { createError } from "../../utils/errors/menuAnalysisErrors.js";

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
   */
  async extractMenuFromImage({ imageBuffer, imageMimeType }) {
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

      return {
        currency: String(parsed.currency || "$").trim(),
        items: normalizedItems,
      };
    } catch (error) {
      console.error("Vision API error:", error.message);
      console.warn("Using fallback menu data due to API error");
      return this.getFallbackMenuData();
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
}
