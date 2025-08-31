// Test script to run image extraction independently
import { extractInfoFromImage } from "../../src/services/restaurant/zhongcao/imageExtraction.js";
import path from "path";
import fs from "fs";

async function testImageExtraction() {
  try {
    console.log("🚀 Testing image extraction function...");

    const imageFileName = "image-1755763282108-205341994.png";
    const imagePath = path.resolve(process.cwd(), "uploads", imageFileName);

    console.log(`📁 Looking for image at: ${imagePath}`);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image file not found at: ${imagePath}`);
      return;
    }

    console.log("✅ Image file found, proceeding with extraction...");
    console.log(`📏 File size: ${fs.statSync(imagePath).size} bytes`);

    const result = await extractInfoFromImage(imageFileName);

    console.log("✅ Extraction completed!");
    console.log("📊 Results:");
    console.log(JSON.stringify(result, null, 2));

    // Show individual fields
    console.log("\n🔍 Extracted Fields:");
    console.log(`🏪 Restaurant: ${result.restaurant_name}`);
    console.log(`🍽️  Dish: ${result.dish_name || "Not specified"}`);
    console.log(`📍 Address: ${result.address || "Not specified"}`);
    console.log(`📝 Description: ${result.description}`);
    console.log(
      `📱 Social Handle: ${result.social_media_handle || "Not specified"}`
    );
  } catch (error) {
    console.error("❌ Error during extraction:", error.message);
    console.error(error.stack);
  }
}

// Run the test
testImageExtraction();
