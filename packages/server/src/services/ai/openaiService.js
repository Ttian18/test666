import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Parse receipt with OpenAI Vision API
  async parseReceipt(imageBuffer, mimeType = "image/jpeg") {
    try {
      const base64 = imageBuffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;

      const systemPrompt = `You are a receipt parsing expert. Extract key information from receipt images and return structured JSON data.`;

      const userPrompt = `Parse this receipt image and extract the following information in JSON format:
      {
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "merchant": "store/restaurant name",
        "merchant_address": "full address",
        "merchant_phone": "phone number",
        "items": [
          {
            "name": "item name",
            "quantity": number,
            "unit_price": number,
            "line_total": number,
            "item_category": "category"
          }
        ],
        "subtotal": number,
        "tax_amount": number,
        "total_amount": number,
        "currency": "USD",
        "payment_method": "payment type",
        "receipt_number": "receipt number",
        "notes": "any additional notes"
      }

      Important:
      - Return only valid JSON
      - Use "Others" for unknown categories
      - Ensure all monetary values are numbers (not strings)
      - If information is not available, use null or empty string`;

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
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const text = response.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new Error("Empty response from OpenAI");
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error("Failed to parse OpenAI response as JSON");
      }

      return parsed;
    } catch (error) {
      console.error("OpenAI Vision API error:", error);
      throw new Error("Failed to parse receipt with AI");
    }
  }

  // Analyze menu image with OpenAI Vision API
  async analyzeMenu(imageBuffer, mimeType = "image/jpeg") {
    try {
      const base64 = imageBuffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;

      const systemPrompt = `You are a menu analysis expert. Extract menu items and their prices from restaurant menu images.`;

      const userPrompt = `Analyze this menu image and extract the following information in JSON format:
      {
        "restaurant_name": "restaurant name",
        "menu_items": [
          {
            "name": "dish name",
            "description": "dish description",
            "price": number,
            "category": "appetizer/main/dessert/drink",
            "dietary_info": ["vegetarian", "vegan", "gluten-free", etc.]
          }
        ],
        "currency": "USD",
        "notes": "any additional information about the menu"
      }

      Important:
      - Return only valid JSON
      - Extract all visible menu items
      - Include prices as numbers
      - Categorize items appropriately`;

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
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const text = response.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new Error("Empty response from OpenAI");
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error("Failed to parse OpenAI response as JSON");
      }

      return parsed;
    } catch (error) {
      console.error("OpenAI Menu Analysis error:", error);
      throw new Error("Failed to analyze menu with AI");
    }
  }

  // Generate restaurant recommendations
  async generateRecommendations(query, context = {}) {
    try {
      const systemPrompt = `You are a restaurant recommendation expert. Provide personalized restaurant recommendations based on user preferences and location.`;

      const userPrompt = `Generate restaurant recommendations for the following query: "${query}"

      Context: ${JSON.stringify(context)}

      Please provide recommendations in JSON format:
      {
        "recommendations": [
          {
            "name": "restaurant name",
            "address": "full address",
            "phone": "phone number",
            "website": "website url",
            "googleMapsLink": "Google Maps link",
            "googleMapsLinkDescription": "description for accessibility",
            "reason": "why this restaurant is recommended",
            "recommendation": "specific dish or experience recommendation",
            "cuisine": "cuisine type",
            "priceRange": "$/$$/$$$/$$$$",
            "rating": "rating out of 5",
            "hours": "operating hours",
            "specialFeatures": ["feature1", "feature2"]
          }
        ],
        "query": "original query"
      }`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const text = response.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new Error("Empty response from OpenAI");
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error("Failed to parse OpenAI response as JSON");
      }

      return parsed;
    } catch (error) {
      console.error("OpenAI Recommendation error:", error);
      throw new Error("Failed to generate recommendations");
    }
  }
}

export default OpenAIService;
