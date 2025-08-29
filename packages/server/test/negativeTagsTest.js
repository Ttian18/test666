import {
  normalizeTags,
  tagsHash,
  parseDynamicNegativeKeys,
  buildDynamicHardTerms,
  splitHardSoftTags,
} from "../src/utils/tagsUtils.js";
import { applyHardFilter } from "../src/services/restaurant/tagHardFilter.js";

console.log("=== Testing User-Defined Negative Tags Implementation ===\n");

// Test 1: Tag normalization with negative patterns
console.log("1. Testing Tag Normalization:");
console.log("Input: 'noChicken, avoid-dairy, exclude nuts'");
const tags1 = normalizeTags("noChicken, avoid-dairy, exclude nuts");
console.log("Output:", tags1);
console.log("Hash:", tagsHash(tags1));

console.log("\nInput: ['no-chicken', 'dairy-free', 'spicy']");
const tags2 = normalizeTags(["no-chicken", "dairy-free", "spicy"]);
console.log("Output:", tags2);
console.log("Hash:", tagsHash(tags2));

// Test 2: Dynamic negative key parsing
console.log("\n2. Testing Dynamic Negative Key Parsing:");
const testTags = ["noChicken", "avoid-dairy", "exclude nuts", "spicy", "vegan"];
console.log("Input tags:", testTags);
const negKeys = parseDynamicNegativeKeys(testTags);
console.log("Parsed negative keys:", negKeys);

// Test 3: Dynamic hard terms building
console.log("\n3. Testing Dynamic Hard Terms Building:");
const terms = buildDynamicHardTerms(negKeys);
console.log("Expanded terms to exclude:", terms);

// Test 4: Tag splitting
console.log("\n4. Testing Tag Splitting:");
const { hardCore, negKeys: parsedNegKeys, soft } = splitHardSoftTags(testTags);
console.log("Hard core tags:", hardCore);
console.log("Negative keys:", parsedNegKeys);
console.log("Soft preferences:", soft);

// Test 5: Hard filter with dynamic negatives
console.log("\n5. Testing Hard Filter with Dynamic Negatives:");
const mockMenuInfo = {
  items: [
    {
      name: "Chicken Parmesan",
      description: "Breaded chicken with cheese and marinara",
      price: 18,
    },
    {
      name: "Vegan Salad",
      description: "Fresh vegetables with vegan dressing",
      price: 12,
    },
    {
      name: "Beef Burger",
      description: "Angus beef with dairy cheese",
      price: 15,
    },
    {
      name: "Dairy-Free Pasta",
      description: "Gluten-free pasta with tomato sauce",
      price: 14,
    },
    {
      name: "Nut-Free Brownie",
      description: "Chocolate brownie without nuts",
      price: 8,
    },
    {
      name: "Spicy Tacos",
      description: "Spicy chicken tacos with dairy",
      price: 16,
    },
  ],
};

console.log("Original items:", mockMenuInfo.items.length);

// Test with noChicken and dairy-free
const filterResult1 = applyHardFilter(mockMenuInfo, [
  "noChicken",
  "dairy-free",
]);
console.log("\nFilter with 'noChicken, dairy-free':");
console.log("- Allowed items:", filterResult1.allowedItems.length);
console.log("- Removed count:", filterResult1.removedCount);
console.log(
  "- Allowed items:",
  filterResult1.allowedItems.map((item) => item.name)
);
console.log(
  "- Debug info:",
  filterResult1.debug.map((d) => `${d.itemName}: ${d.reason}`)
);

// Test with vegan (core hard filter)
const filterResult2 = applyHardFilter(mockMenuInfo, ["vegan"]);
console.log("\nFilter with 'vegan':");
console.log("- Allowed items:", filterResult2.allowedItems.length);
console.log("- Removed count:", filterResult2.removedCount);
console.log(
  "- Allowed items:",
  filterResult2.allowedItems.map((item) => item.name)
);

// Test with mixed hard and soft
const filterResult3 = applyHardFilter(mockMenuInfo, ["noChicken", "spicy"]);
console.log("\nFilter with 'noChicken, spicy':");
console.log("- Allowed items:", filterResult3.allowedItems.length);
console.log("- Removed count:", filterResult3.removedCount);
console.log("- Hard core:", filterResult3.hardCore);
console.log("- Negative keys:", filterResult3.negKeys);
console.log("- Soft preferences:", filterResult3.soft);

console.log("\n=== Test Complete ===");
