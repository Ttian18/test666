export const categories: string[] = [
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
export const isValidCategory = (category: string): boolean => {
  return categories.includes(category);
};

// Get default category
export const getDefaultCategory = (): string => {
  return "Other";
};
