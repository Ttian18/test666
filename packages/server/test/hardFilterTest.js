import { applyHardFilter } from "../src/services/restaurant/tagHardFilter.js";

// Test the hard filter with word boundary matching
console.log("=== Testing Hard Filter with Word Boundary Matching ===");

// Mock menu data
const mockMenuInfo = {
  items: [
    { name: "Steak", description: "Grilled beef steak" },
    { name: "Ice Tea", description: "Refreshing iced tea" },
    { name: "Hot Tea", description: "Traditional hot tea" },
    { name: "Steakhouse Burger", description: "Beef burger with steak sauce" },
    { name: "Tea Time", description: "Afternoon tea service" },
    { name: "Chicken Steak", description: "Chicken prepared like steak" },
    { name: "Green Tea", description: "Healthy green tea" },
    { name: "Beef Steak", description: "Premium beef cut" },
    { name: "Tea Leaves", description: "Fresh tea leaves" },
    { name: "Steakhouse Special", description: "House specialty steak" },
  ],
};

// Test cases
const testCases = [
  {
    tags: ["no tea"],
    expectedFiltered: [
      "Ice Tea",
      "Hot Tea",
      "Tea Time",
      "Green Tea",
      "Tea Leaves",
    ],
    expectedRemaining: [
      "Steak",
      "Steakhouse Burger",
      "Chicken Steak",
      "Beef Steak",
      "Steakhouse Special",
    ],
  },
  {
    tags: ["no steak"],
    expectedFiltered: [
      "Steak",
      "Steakhouse Burger",
      "Chicken Steak",
      "Beef Steak",
      "Steakhouse Special",
    ],
    expectedRemaining: [
      "Ice Tea",
      "Hot Tea",
      "Tea Time",
      "Green Tea",
      "Tea Leaves",
    ],
  },
  {
    tags: ["no tea", "no steak"],
    expectedFiltered: [
      "Steak",
      "Ice Tea",
      "Hot Tea",
      "Steakhouse Burger",
      "Tea Time",
      "Chicken Steak",
      "Green Tea",
      "Beef Steak",
      "Tea Leaves",
      "Steakhouse Special",
    ],
    expectedRemaining: [],
  },
];

testCases.forEach((testCase, index) => {
  console.log(`\n--- Test Case ${index + 1}: ${testCase.tags.join(", ")} ---`);

  const result = applyHardFilter(mockMenuInfo, testCase.tags);

  console.log("Tags applied:", testCase.tags);
  console.log("Items removed:", result.removedCount);
  console.log("Items remaining:", result.allowedItems.length);

  const filteredNames = mockMenuInfo.items
    .filter(
      (item) =>
        !result.allowedItems.some((allowed) => allowed.name === item.name)
    )
    .map((item) => item.name);

  const remainingNames = result.allowedItems.map((item) => item.name);

  console.log("Actually filtered:", filteredNames);
  console.log("Actually remaining:", remainingNames);

  // Check if filtering worked correctly
  const correctFiltering =
    testCase.expectedFiltered.every((name) => filteredNames.includes(name)) &&
    testCase.expectedRemaining.every((name) => remainingNames.includes(name));

  console.log(`Result: ${correctFiltering ? "✅ PASS" : "❌ FAIL"}`);

  if (!correctFiltering) {
    console.log("Debug info:", result.debug);
  }
});
