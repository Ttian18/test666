import { normalizeTags, tagsHash } from "../src/utils/tagsUtils.js";
import { applyHardFilter } from "../src/services/restaurant/tagHardFilter.js";

// Test tag normalization
console.log("=== Testing Tag Normalization ===");
console.log("Input: 'vegan, gluten-free'");
console.log("Output:", normalizeTags("vegan, gluten-free"));
console.log("Hash:", tagsHash(normalizeTags("vegan, gluten-free")));

console.log("\nInput: ['VEGAN', 'Vegetarian']");
console.log("Output:", normalizeTags(["VEGAN", "Vegetarian"]));
console.log("Hash:", tagsHash(normalizeTags(["VEGAN", "Vegetarian"])));

console.log("\nInput: null");
console.log("Output:", normalizeTags(null));

// Test hard filter
console.log("\n=== Testing Hard Filter ===");
const mockMenuInfo = {
  items: [
    {
      name: "Chicken Burger",
      description: "Grilled chicken with lettuce and tomato",
      price: 12,
    },
    {
      name: "Vegan Salad",
      description: "Fresh vegetables with vegan dressing",
      price: 8,
    },
    {
      name: "Beef Steak",
      description: "Premium beef with garlic butter",
      price: 25,
    },
    {
      name: "Gluten-Free Pasta",
      description: "Rice pasta with tomato sauce",
      price: 15,
    },
    {
      name: "Bread Basket",
      description: "Fresh baked bread with butter",
      price: 5,
    },
  ],
};

console.log("Original items:", mockMenuInfo.items.length);

const veganResult = applyHardFilter(mockMenuInfo, ["vegan"]);
console.log(
  "\nVegan filter - Allowed:",
  veganResult.allowedItems.length,
  "Removed:",
  veganResult.removedCount
);
console.log(
  "Allowed items:",
  veganResult.allowedItems.map((item) => item.name)
);

const glutenFreeResult = applyHardFilter(mockMenuInfo, ["glutenfree"]);
console.log(
  "\nGluten-free filter - Allowed:",
  glutenFreeResult.allowedItems.length,
  "Removed:",
  glutenFreeResult.removedCount
);
console.log(
  "Allowed items:",
  glutenFreeResult.allowedItems.map((item) => item.name)
);

const combinedResult = applyHardFilter(mockMenuInfo, ["vegan", "glutenfree"]);
console.log(
  "\nCombined filter - Allowed:",
  combinedResult.allowedItems.length,
  "Removed:",
  combinedResult.removedCount
);
console.log(
  "Allowed items:",
  combinedResult.allowedItems.map((item) => item.name)
);

console.log("\n=== Test Complete ===");
