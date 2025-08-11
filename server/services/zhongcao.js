import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

// 1. Define the exact JSON structure you want for the output
const restaurantSchema = z.object({
  restaurant_name: z
    .string()
    .describe("The name of the restaurant mentioned in the screenshot."),
  dish_name: z
    .string()
    .nullable()
    .describe(
      "The specific dish featured, if mentioned. Return null if not mentioned."
    ),
  address: z
    .string()
    .nullable()
    .describe(
      "The address of the restaurant, if visible in the screenshot. Return null if not visible."
    ),
  description: z
    .string()
    .describe("A brief, one-sentence summary of the image content."),
  social_media_handle: z
    .string()
    .nullable()
    .describe(
      "The social media username or handle, if visible (e.g., @username). Return null if not visible."
    ),
});

// 2. Initialize the model and chain it with the schema
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
  const imagePath = path.resolve(process.cwd(), "uploads", imageFileName);
  const base64Image = fs.readFileSync(imagePath, "base64");

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
  return response;
}
