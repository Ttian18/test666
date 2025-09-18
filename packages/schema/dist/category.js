"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultCategory = exports.isValidCategory = exports.categories = void 0;
exports.categories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Healthcare",
    "Education",
    "Travel",
    "Housing",
    "Utilities",
    "Subscriptions",
    "Other",
];
// Category validation function
const isValidCategory = (category) => {
    return exports.categories.includes(category);
};
exports.isValidCategory = isValidCategory;
// Get default category
const getDefaultCategory = () => {
    return "Other";
};
exports.getDefaultCategory = getDefaultCategory;
