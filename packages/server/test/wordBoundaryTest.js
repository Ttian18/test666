// Test word boundary matching to ensure "tea" doesn't match "steak"
console.log("=== Testing Word Boundary Matching ===");

const testCases = [
  { text: "steak", term: "tea", shouldMatch: false },
  { text: "ice tea", term: "tea", shouldMatch: true },
  { text: "hot tea", term: "tea", shouldMatch: true },
  { text: "steak dinner", term: "tea", shouldMatch: false },
  { text: "chicken steak", term: "tea", shouldMatch: false },
  { text: "tea time", term: "tea", shouldMatch: true },
  { text: "steakhouse", term: "tea", shouldMatch: false },
  { text: "green tea", term: "tea", shouldMatch: true },
  { text: "beef steak", term: "tea", shouldMatch: false },
  { text: "tea leaves", term: "tea", shouldMatch: true },
];

function testWordBoundary(text, term) {
  const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, "i");
  return wordBoundaryRegex.test(text);
}

function testSimpleInclude(text, term) {
  return text.toLowerCase().includes(term.toLowerCase());
}

console.log("Word Boundary Matching:");
testCases.forEach(({ text, term, shouldMatch }) => {
  const result = testWordBoundary(text, term);
  const status = result === shouldMatch ? "✅" : "❌";
  console.log(
    `${status} "${text}" with "${term}": ${result} (expected: ${shouldMatch})`
  );
});

console.log("\nSimple Include Matching (for comparison):");
testCases.forEach(({ text, term, shouldMatch }) => {
  const result = testSimpleInclude(text, term);
  const status = result === shouldMatch ? "✅" : "❌";
  console.log(
    `${status} "${text}" with "${term}": ${result} (expected: ${shouldMatch})`
  );
});
