import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import * as fs from "fs";
import * as path from "path";
import { restaurantSchema, fallbackRestaurantData } from "schema";
import "dotenv/config";

// Initialize the model and chain it with the schema
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
}).withStructuredOutput(restaurantSchema);

/**
 * Extracts structured restaurant info from a local image file.
 * @param {string} imageFileName - The name of the image file located in the uploads directory.
 * @returns {Promise<object>} A promise that resolves to the structured data.
 */
export async function extractInfoFromImage(imageFileName) {
  console.log(`🤖 Analyzing ${imageFileName}...`);
  try {
    const imagePath = path.resolve(process.cwd(), "uploads", imageFileName);
    if (!fs.existsSync(imagePath)) {
      console.warn("Zhongcao image not found, returning fallback data");
      return fallbackRestaurantData;
    }

    const base64Image = fs.readFileSync(imagePath, "base64");
    if (!base64Image || base64Image.length < 100) {
      console.warn("Zhongcao image too small, returning fallback data");
      return fallbackRestaurantData;
    }

    const prompt = new HumanMessage({
      content: [
        {
          type: "text",
          text: "Extract information from this social media screenshot about a restaurant. Fulfill the schema based on the image content.",
        },
        {
          type: "image_url",
          image_url: { url: `data:image/png;base64,${base64Image}` },
        },
      ],
    });

    const response = await model.invoke([prompt]);

    // Normalize: ensure minimum fields and sensible defaults
    if (!response || typeof response !== "object") {
      return fallbackRestaurantData;
    }

    const normalized = {
      restaurant_name:
        response.restaurant_name || fallbackRestaurantData.restaurant_name,
      dish_name: response.dish_name ?? null,
      address: response.address ?? null,
      description: response.description || fallbackRestaurantData.description,
      social_media_handle: response.social_media_handle ?? null,
    };

    return normalized;
  } catch (error) {
    console.error("Zhongcao extraction failed:", error.message);
    return fallbackRestaurantData;
  }
}
