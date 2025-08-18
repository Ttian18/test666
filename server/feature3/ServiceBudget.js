import OpenAI from "openai";
import { createError } from "./errors.js";

export default class ServiceBudget {
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
    if (
      !menuInfo ||
      !Array.isArray(menuInfo.items) ||
      menuInfo.items.length === 0
    ) {
      throw createError.internalError("Menu info is empty");
    }

    const currency = menuInfo.currency || "$";

    const systemPrompt =
      "You are a helpful dining planner. Choose a set of dishes that maximizes value and taste while staying within budget." +
      " Prefer variety (appetizer/main/drink/dessert if applicable), account for sharing when logical, and avoid exceeding the budget." +
      " Output clear JSON strictly matching the schema.";

    const schemaHint =
      '{ "total": number, "currency": string, "items": [{ "name": string, "qty": number, "unit_price": number, "subtotal": number }], "rationale": string }';

    const payload = {
      currency,
      budget,
      items: menuInfo.items,
      note: userNote,
    };

    if (this.isMock) {
      const chosen = [];
      let running = 0;
      for (const item of menuInfo.items) {
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
        currency: menuInfo.currency || "$",
        items: chosen,
        rationale:
          "Mocked recommendation in TEST_MODE using greedy selection under budget.",
        budget,
        withinBudget: running <= budget,
      };
    }

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
      throw createError.budgetApiError("Empty response from budget planner");
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw createError.budgetApiError("Failed to parse budget JSON", e);
    }

    // Minimal normalization
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const normalized = items
      .map((it) => ({
        name: String(it.name || "").trim(),
        qty: Math.max(1, Number(it.qty) || 1),
        unit_price: Number(it.unit_price),
        subtotal: Number(it.subtotal),
      }))
      .filter(
        (it) =>
          it.name &&
          Number.isFinite(it.unit_price) &&
          Number.isFinite(it.subtotal)
      );

    const total = Number(parsed.total);

    return {
      total: Number.isFinite(total)
        ? total
        : normalized.reduce((s, it) => s + it.subtotal, 0),
      currency: parsed.currency || currency,
      items: normalized,
      rationale:
        typeof parsed.rationale === "string" ? parsed.rationale.trim() : "",
      budget,
      withinBudget: Number.isFinite(total)
        ? total <= budget
        : normalized.reduce((s, it) => s + it.subtotal, 0) <= budget,
    };
  }
}
