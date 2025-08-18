import OpenAI from "openai";
import { createError } from "./errors.js";

export default class ServiceImage {
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
    // Turn the image buffer into base64 data URL for the vision model
    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:${imageMimeType};base64,${base64}`;

    const systemPrompt =
      "You are a precise OCR and information extraction assistant for restaurant menus." +
      " Extract all dishes with name, description if available, price as a number, and currency symbol or code." +
      " Return concise, correct data only.";

    const userPrompt =
      "From this menu image, extract a JSON object with: { currency: string, items: [{ name: string, description?: string, price: number, category?: string }] }." +
      " Ensure prices are numeric, and do not include currency symbols in the number.";

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
      throw createError.visionApiError("Empty response from vision");
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw createError.visionApiError("Failed to parse vision JSON", e);
    }

    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const normalizedItems = items
      .map((it) => ({
        name: String(it.name || "").trim(),
        description: it.description ? String(it.description).trim() : "",
        price: Number(it.price),
        category: it.category ? String(it.category).trim() : "",
      }))
      .filter((it) => it.name && Number.isFinite(it.price) && it.price >= 0);

    // Check if no menu items were extracted
    if (normalizedItems.length === 0) {
      throw createError.noMenuItems();
    }

    return {
      currency: typeof parsed.currency === "string" ? parsed.currency : "$",
      items: normalizedItems,
    };
  }
}
