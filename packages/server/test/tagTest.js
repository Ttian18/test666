import { normalizeTags, parseDynamicNegativeKeys, buildDynamicHardTerms, splitHardSoftTags } from '../src/utils/tagsUtils.js';

// Test tag parsing
console.log('=== Testing Tag Parsing ===');

// Test 1: "no mushrooms"
const tags1 = ["no mushrooms"];
const normalized1 = normalizeTags(tags1);
console.log('Input:', tags1);
console.log('Normalized:', normalized1);
console.log('Negative keys:', parseDynamicNegativeKeys(normalized1));
console.log('Hard terms:', buildDynamicHardTerms(parseDynamicNegativeKeys(normalized1)));
console.log('Split:', splitHardSoftTags(normalized1));
console.log('');

// Test 2: "no mushrooms, no tea"
const tags2 = ["no mushrooms", "no tea"];
const normalized2 = normalizeTags(tags2);
console.log('Input:', tags2);
console.log('Normalized:', normalized2);
console.log('Negative keys:', parseDynamicNegativeKeys(normalized2));
console.log('Hard terms:', buildDynamicHardTerms(parseDynamicNegativeKeys(normalized2)));
console.log('Split:', splitHardSoftTags(normalized2));
console.log('');

// Test 3: "no mushrooms, no tea, spicy"
const tags3 = ["no mushrooms", "no tea", "spicy"];
const normalized3 = normalizeTags(tags3);
console.log('Input:', tags3);
console.log('Normalized:', normalized3);
console.log('Negative keys:', parseDynamicNegativeKeys(normalized3));
console.log('Hard terms:', buildDynamicHardTerms(parseDynamicNegativeKeys(normalized3)));
console.log('Split:', splitHardSoftTags(normalized3));
console.log('');

// Test 4: String input
const tags4 = "no mushrooms, no tea, spicy";
const normalized4 = normalizeTags(tags4);
console.log('Input:', tags4);
console.log('Normalized:', normalized4);
console.log('Negative keys:', parseDynamicNegativeKeys(normalized4));
console.log('Hard terms:', buildDynamicHardTerms(parseDynamicNegativeKeys(normalized4)));
console.log('Split:', splitHardSoftTags(normalized4));
