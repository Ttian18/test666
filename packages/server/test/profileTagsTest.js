import {
  mapProfileDiningStyleToTags,
  determineFinalTags,
} from "../src/utils/tagsUtils.js";

console.log("Testing Profile-Based Tag Functionality\n");

// Test 1: Profile dining style mapping
console.log("1. Testing Profile Dining Style Mapping:");
const testDiningStyles = [
  ["Vegan", "Gluten-free"],
  ["Vegetarian", "Dairy Free"],
  ["Halal", "Low-carb"],
  ["Keto", "Nut-free"],
  ["Pescatarian", "Shellfish-free"],
  ["Vegan", "Vegan"], // Duplicate test
  ["invalid-style", "unknown-preference"], // Invalid styles
  [], // Empty array
];

testDiningStyles.forEach((styles, index) => {
  const result = mapProfileDiningStyleToTags(styles);
  console.log(`   Input: [${styles.join(", ")}]`);
  console.log(`   Output: [${result.join(", ")}]`);
  console.log(`   Source: ${result.length > 0 ? "profile" : "empty"}\n`);
});

// Test 2: Tag determination strategy
console.log("2. Testing Tag Determination Strategy:");

const testCases = [
  {
    name: "User provides tags",
    requestTags: ["spicy", "asian"],
    ignoreProfileTags: false,
    profileTags: ["vegan", "glutenfree"],
    expectedSource: "user",
  },
  {
    name: "No user tags, profile available",
    requestTags: [],
    ignoreProfileTags: false,
    profileTags: ["vegan", "glutenfree"],
    expectedSource: "profile",
  },
  {
    name: "No user tags, profile available, ignore profile",
    requestTags: [],
    ignoreProfileTags: true,
    profileTags: ["vegan", "glutenfree"],
    expectedSource: "defaults",
  },
  {
    name: "No user tags, no profile",
    requestTags: [],
    ignoreProfileTags: false,
    profileTags: [],
    expectedSource: "defaults",
  },
  {
    name: "User tags take precedence over profile",
    requestTags: ["halal"],
    ignoreProfileTags: false,
    profileTags: ["vegan", "glutenfree"],
    expectedSource: "user",
  },
];

testCases.forEach((testCase, index) => {
  const result = determineFinalTags({
    requestTags: testCase.requestTags,
    ignoreProfileTags: testCase.ignoreProfileTags,
    profileTags: testCase.profileTags,
  });

  const passed = result.source === testCase.expectedSource;
  console.log(`   ${index + 1}. ${testCase.name}:`);
  console.log(`      Request tags: [${testCase.requestTags.join(", ")}]`);
  console.log(`      Profile tags: [${testCase.profileTags.join(", ")}]`);
  console.log(`      Ignore profile: ${testCase.ignoreProfileTags}`);
  console.log(
    `      Result: [${result.finalTags.join(", ")}] (source: ${result.source})`
  );
  console.log(`      Expected source: ${testCase.expectedSource}`);
  console.log(`      Status: ${passed ? "PASS" : "FAIL"}\n`);
});

// Test 3: Edge cases
console.log("3. Testing Edge Cases:");

const edgeCases = [
  {
    name: "Null/undefined inputs",
    requestTags: null,
    ignoreProfileTags: undefined,
    profileTags: null,
  },
  {
    name: "Empty arrays",
    requestTags: [],
    ignoreProfileTags: false,
    profileTags: [],
  },
  {
    name: "Mixed valid/invalid profile tags",
    requestTags: [],
    ignoreProfileTags: false,
    profileTags: ["Vegan", "InvalidStyle", "Gluten-free", "UnknownPreference"],
  },
];

edgeCases.forEach((edgeCase, index) => {
  const result = determineFinalTags({
    requestTags: edgeCase.requestTags,
    ignoreProfileTags: edgeCase.ignoreProfileTags,
    profileTags: edgeCase.profileTags,
  });

  console.log(`   ${index + 1}. ${edgeCase.name}:`);
  console.log(
    `      Result: [${result.finalTags.join(", ")}] (source: ${result.source})`
  );
  console.log(`      Tags count: ${result.finalTags.length}\n`);
});

console.log("Profile-based tag functionality test completed!");
