// Test calories implementation
import { normalizeCalories, caloriesHash } from '../src/utils/caloriesUtils.js';

console.log('=== Testing Calories Implementation ===');

// Test normalizeCalories
console.log('\n1. Testing normalizeCalories:');
console.log('normalizeCalories(500):', normalizeCalories(500));
console.log('normalizeCalories("600"):', normalizeCalories('600'));
console.log('normalizeCalories({"maxPerPerson": 700}):', normalizeCalories({'maxPerPerson': 700}));
console.log('normalizeCalories("{\\"maxPerPerson\\": 800}"):', normalizeCalories('{"maxPerPerson": 800}'));
console.log('normalizeCalories(null):', normalizeCalories(null));
console.log('normalizeCalories(undefined):', normalizeCalories(undefined));

// Test caloriesHash
console.log('\n2. Testing caloriesHash:');
const testCalories = { maxPerPerson: 500 };
console.log('caloriesHash({maxPerPerson: 500}):', caloriesHash(testCalories));
console.log('caloriesHash(null):', caloriesHash(null));

// Test cache key uniqueness
console.log('\n3. Testing cache key uniqueness:');
const hash1 = caloriesHash({ maxPerPerson: 500 });
const hash2 = caloriesHash({ maxPerPerson: 600 });
const hash3 = caloriesHash({ maxPerPerson: 500 });
console.log('Hash for 500 calories:', hash1);
console.log('Hash for 600 calories:', hash2);
console.log('Hash for 500 calories again:', hash3);
console.log('Hashes different for different values:', hash1 !== hash2);
console.log('Hashes same for same values:', hash1 === hash3);

console.log('\n✅ Calories implementation test completed!');
