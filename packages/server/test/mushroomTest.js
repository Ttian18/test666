// Test mushroom filtering specifically
console.log('=== Testing Mushroom Filtering ===');

// Test word boundary matching for "mushroom"
function testWordBoundary(text, term) {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordBoundaryRegex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
  return wordBoundaryRegex.test(text);
}

const testCases = [
  { text: "mushroom", term: "mushroom", shouldMatch: true },
  { text: "mushrooms", term: "mushroom", shouldMatch: true },
  { text: "stuffed mushrooms", term: "mushroom", shouldMatch: true },
  { text: "mushroom risotto", term: "mushroom", shouldMatch: true },
  { text: "steak", term: "mushroom", shouldMatch: false },
  { text: "steakhouse", term: "mushroom", shouldMatch: false },
  { text: "chicken", term: "mushroom", shouldMatch: false },
  { text: "beef", term: "mushroom", shouldMatch: false },
];

console.log('Word Boundary Matching Results:');
testCases.forEach(({ text, term, shouldMatch }) => {
  const result = testWordBoundary(text, term);
  const status = result === shouldMatch ? '✅' : '❌';
  console.log(`${status} "${text}" with "${term}": ${result} (expected: ${shouldMatch})`);
});

// Test the actual hard filter function
console.log('\n=== Testing Hard Filter Function ===');

// Mock menu data with mushroom items
const mockMenuInfo = {
  items: [
    { name: "Stuffed Mushrooms", description: "Mushrooms stuffed with cheese" },
    { name: "Mushroom Risotto", description: "Creamy risotto with mushrooms" },
    { name: "Steak", description: "Grilled beef steak" },
    { name: "Chicken", description: "Grilled chicken breast" },
    { name: "Ice Tea", description: "Refreshing iced tea" },
  ]
};

// Import the hard filter function
import('../src/services/restaurant/tagHardFilter.js').then(({ applyHardFilter }) => {
  console.log('\nTesting "no mushroom" filter:');
  const result = applyHardFilter(mockMenuInfo, ["no mushroom"]);
  
  console.log('Items removed:', result.removedCount);
  console.log('Items remaining:', result.allowedItems.length);
  
  const filteredNames = mockMenuInfo.items
    .filter(item => !result.allowedItems.some(allowed => allowed.name === item.name))
    .map(item => item.name);
  
  const remainingNames = result.allowedItems.map(item => item.name);
  
  console.log('Filtered out:', filteredNames);
  console.log('Remaining:', remainingNames);
  
  // Check if mushrooms were filtered out
  const mushroomsFiltered = filteredNames.some(name => 
    name.toLowerCase().includes('mushroom')
  );
  
  console.log(`Mushrooms filtered: ${mushroomsFiltered ? '✅ YES' : '❌ NO'}`);
  
  if (!mushroomsFiltered) {
    console.log('Debug info:', result.debug);
  }
}).catch(error => {
  console.error('Error importing hard filter:', error.message);
});
