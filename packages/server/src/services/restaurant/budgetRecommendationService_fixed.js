import OpenAI from "openai";
import { createError } from "../../utils/errors/menuAnalysisErrors.js";

export default class BudgetRecommendationService {
  constructor({ openai } = {}) {
    const isTestMode = String(process.env.TEST_MODE || "").trim() === "1";
    const apiKey = process.env.OPENAI_API_KEY;
    this.isMock = isTestMode || !apiKey;

    this.openai = this.isMock ? null : openai || new OpenAI({ apiKey });
  }

  /**
   * Consumes extracted menu info and budget and asks OpenAI to recommend dishes.
   * Returns a structure with selected dishes and a short rationale.
   */
  async recommendDishes({ menuInfo, budget, userNote = "" }) {
    // Handle empty menu gracefully
    if (
      !menuInfo ||
      !Array.isArray(menuInfo.items) ||
      menuInfo.items.length === 0
    ) {
      return {
        total: 0,
        currency: "$",
        items: [],
        rationale:
          "No menu items available for recommendation. Please try uploading a clearer menu image.",
        budget,
        withinBudget: true,
      };
    }

    const currency = menuInfo.currency || "$";
    const validItems = menuInfo.items.filter((item) => item.price > 0);

    if (validItems.length === 0) {
      return {
        total: 0,
        currency,
        items: [],
        rationale:
          "No valid menu items with prices found. Please check the menu image quality.",
        budget,
        withinBudget: true,
      };
    }

    // Check if any items are within budget
    const affordableItems = validItems.filter((item) => item.price <= budget);

    if (affordableItems.length === 0) {
      return {
        total: 0,
        currency,
        items: [],
        rationale: `All menu items exceed your budget of ${currency}${budget}. Consider increasing your budget or choosing a different restaurant.`,
        budget,
        withinBudget: false,
      };
    }

    const systemPrompt =
      "You are a helpful dining planner. Choose a set of dishes that maximizes value and taste while staying within budget." +
      " Prefer variety (appetizer/main/drink/dessert if applicable), account for sharing when logical, and avoid exceeding the budget." +
      " Output clear JSON strictly matching the schema.";

    const schemaHint =
      '{ "total": number, "currency": string, "items": [{ "name": string, "qty": number, "unit_price": number, "subtotal": number }], "rationale": string }';

    const payload = {
      currency,
      budget,
      items: validItems,
      note: userNote,
    };

    if (this.isMock) {
      return this.getMockRecommendation(validItems, budget, currency);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here is the extracted menu JSON and a budget. Choose dishes within budget and respond ONLY with JSON matching ${schemaHint}.\n\nMenu: ${JSON.stringify(
              payload
            )}`,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const text = response.choices?.[0]?.message?.content?.trim();
      if (!text) {
        console.warn("Empty response from budget planner, using fallback");
        return this.getFallbackRecommendation(validItems, budget, currency);
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.warn("Failed to parse budget JSON, using fallback:", e.message);
        return this.getFallbackRecommendation(validItems, budget, currency);
      }

      // Minimal normalization
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      const normalized = items
        .map((it) => ({
          name: String(it.name || "").trim(),
          qty: Math.max(1, Number(it.qty) || 1),
          unit_price: Number(it.unit_price) || 0,
          subtotal: Number(it.subtotal) || 0,
        }))
        .filter((it) => it.name && it.unit_price > 0);

      const total = Number(parsed.total) || 0;
      const rationale = String(parsed.rationale || "").trim();

      // Validate the recommendation
      if (normalized.length === 0 || total === 0) {
        console.warn("Invalid recommendation from AI, using fallback");
        return this.getFallbackRecommendation(validItems, budget, currency);
      }

      return {
        total,
        currency: String(parsed.currency || currency).trim(),
        items: normalized,
        rationale,
        budget,
        withinBudget: total <= budget,
      };
    } catch (error) {
      console.error("Budget API error:", error.message);
      return this.getFallbackRecommendation(validItems, budget, currency);
    }
  }

  /**
   * Provides mock recommendation for test mode
   */
  getMockRecommendation(items, budget, currency) {
    const chosen = [];
    let running = 0;

    for (const item of items) {
      if (running + item.price <= budget) {
        chosen.push({
          name: item.name,
          qty: 1,
          unit_price: item.price,
          subtotal: item.price,
        });
        running += item.price;
      }
    }

    return {
      total: running,
      currency: currency,
      items: chosen,
      rationale:
        "Mocked recommendation in TEST_MODE using greedy selection under budget.",
      budget,
      withinBudget: running <= budget,
    };
  }

  /**
   * Provides fallback recommendation when AI fails
   */
  getFallbackRecommendation(items, budget, currency) {
    const chosen = [];
    let running = 0;

    // Simple greedy selection as fallback
    for (const item of items) {
      if (running + item.price <= budget) {
        chosen.push({
          name: item.name,
          qty: 1,
          unit_price: item.price,
          subtotal: item.price,
        });
        running += item.price;
      }
    }

    return {
      total: running,
      currency: currency,
      items: chosen,
      rationale: "Fallback recommendation using simple selection algorithm.",
      budget,
      withinBudget: running <= budget,
    };
  }
}
