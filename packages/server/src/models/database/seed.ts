import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Sample data arrays for generating realistic entries
const restaurantNames: string[] = [
  "Golden Dragon Restaurant",
  "Lucky Star Chinese",
  "Peking Palace",
  "Shanghai Garden",
  "Oriental Express",
  "Dynasty Restaurant",
  "Imperial Palace",
  "Jade Garden",
  "Red Lantern",
  "Silk Road Kitchen",
  "Ming Dynasty",
  "Canton House",
  "Sichuan Spice",
  "Beijing Bistro",
  "Hong Kong Cafe",
];

const dishNames: string[] = [
  "Kung Pao Chicken",
  "Sweet and Sour Pork",
  "General Tso's Chicken",
  "Beef and Broccoli",
  "Orange Chicken",
  "Mapo Tofu",
  "Peking Duck",
  "Dim Sum Platter",
  "Hot and Sour Soup",
  "Wonton Soup",
  "Fried Rice",
  "Lo Mein",
  "Chow Mein",
  "Egg Rolls",
  "Spring Rolls",
  "Dumplings",
  "Sesame Chicken",
  "Lemon Chicken",
  "Honey Walnut Shrimp",
  "Mongolian Beef",
];

const addresses: string[] = [
  "123 Main Street, Downtown",
  "456 Oak Avenue, Midtown",
  "789 Pine Street, Uptown",
  "321 Elm Road, Westside",
  "654 Maple Drive, Eastside",
  "987 Cedar Lane, North District",
  "147 Birch Boulevard, South Quarter",
  "258 Spruce Way, Central Plaza",
  "369 Willow Court, Riverside",
  "741 Aspen Circle, Hillcrest",
];

const socialMediaHandles: string[] = [
  "@goldendragon_nyc",
  "@luckystar_chinese",
  "@pekingpalace_food",
  "@shanghaigarden_ny",
  "@orientalexpress_kitchen",
  "@dynasty_restaurant",
  "@imperialpalace_nyc",
  "@jadegarden_food",
  "@redlantern_kitchen",
  "@silkroad_cuisine",
  "@mingdynasty_ny",
  "@cantonhouse_food",
  "@sichuanspice_kitchen",
  "@beijingbistro_nyc",
  "@hongkongcafe_food",
];

const descriptions: string[] = [
  "Amazing authentic Chinese cuisine with fresh ingredients and traditional recipes passed down through generations.",
  "A hidden gem serving the best Chinese food in the neighborhood with excellent service and cozy atmosphere.",
  "Modern take on classic Chinese dishes with a fusion twist that keeps customers coming back for more.",
  "Family-owned restaurant specializing in regional Chinese cuisine with homemade sauces and fresh vegetables.",
  "Upscale Chinese dining experience with elegant presentation and sophisticated flavors.",
  "Casual Chinese eatery known for generous portions and quick service, perfect for lunch or dinner.",
  "Traditional Chinese restaurant with a contemporary vibe, featuring both classic and innovative dishes.",
  "Authentic Chinese flavors in a relaxed setting, perfect for family gatherings and business meetings.",
  "Chef-driven Chinese restaurant focusing on seasonal ingredients and creative interpretations of traditional dishes.",
  "Cozy Chinese bistro offering comfort food with a gourmet touch and excellent wine pairings.",
];

const originalFilenames: string[] = [
  "food_photo_001.jpg",
  "restaurant_shot_002.png",
  "dish_image_003.jpeg",
  "menu_item_004.jpg",
  "cuisine_photo_005.png",
  "kitchen_shot_006.jpeg",
  "dining_room_007.jpg",
  "chef_special_008.png",
  "appetizer_009.jpeg",
  "main_course_010.jpg",
  "dessert_photo_011.png",
  "beverage_shot_012.jpeg",
  "atmosphere_013.jpg",
  "service_photo_014.png",
  "interior_shot_015.jpeg",
];

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random date within the last 30 days
function getRandomDate(): Date {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(
    thirtyDaysAgo.getTime() +
      Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
  );
}

async function seedDatabase(): Promise<void> {
  try {
    console.log("Starting to seed ZhongcaoResult table...");

    const entries = [];

    // Generate 100 entries
    for (let i = 1; i <= 100; i++) {
      const entry = {
        originalFilename: getRandomItem(originalFilenames),
        restaurantName: getRandomItem(restaurantNames),
        dishName: getRandomItem(dishNames),
        address: getRandomItem(addresses),
        description: getRandomItem(descriptions),
        socialMediaHandle: getRandomItem(socialMediaHandles),
        processedAt: getRandomDate(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      entries.push(entry);
    }

    // Insert all entries
    const result = await prisma.zhongcaoResult.createMany({
      data: entries,
      skipDuplicates: true,
    });

    console.log(
      `Successfully created ${result.count} entries in ZhongcaoResult table!`
    );
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDatabase();