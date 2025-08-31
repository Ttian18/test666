import { z } from "zod";

/**
 * Schema for restaurant information extracted from social media images
 */
export const restaurantSchema = z.object({
  restaurant_name: z
    .string()
    .describe("The name of the restaurant mentioned in the screenshot."),
  dish_name: z
    .string()
    .nullable()
    .describe(
      "The specific dish featured, if mentioned. Return null if not mentioned. Use the language of the image content to determine the dish name."
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

export type RestaurantInfo = z.infer<typeof restaurantSchema>;

// Test comment: Direct TypeScript import working! ✅ CONFIRMED WORKING!

/**
 * Fallback restaurant data when extraction fails
 */
export const fallbackRestaurantData: RestaurantInfo = {
  restaurant_name: "Sample Restaurant",
  dish_name: null,
  address: null,
  description:
    "The image content is not visible, so no information can be extracted.",
  social_media_handle: null,
};
