// Category mapping and utility functions for transaction processing

// All available categories
const ALL_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Education",
  "Travel",
  "Utilities",
  "Insurance",
  "Investment",
  "Gifts",
  "Personal Care",
  "Home & Garden",
  "Technology",
  "Sports & Fitness",
  "Books & Media",
  "Pets",
  "Legal",
  "Taxes",
  "Others",
];

// Merchant category mapping
const MERCHANT_CATEGORIES = {
  restaurant: "Food & Dining",
  cafe: "Food & Dining",
  coffee: "Food & Dining",
  pizza: "Food & Dining",
  burger: "Food & Dining",
  sushi: "Food & Dining",
  chinese: "Food & Dining",
  italian: "Food & Dining",
  mexican: "Food & Dining",
  indian: "Food & Dining",
  thai: "Food & Dining",
  japanese: "Food & Dining",
  korean: "Food & Dining",
  vietnamese: "Food & Dining",
  mediterranean: "Food & Dining",
  greek: "Food & Dining",
  french: "Food & Dining",
  spanish: "Food & Dining",
  american: "Food & Dining",
  "fast food": "Food & Dining",
  takeout: "Food & Dining",
  delivery: "Food & Dining",
  grocery: "Food & Dining",
  supermarket: "Food & Dining",
  convenience: "Food & Dining",
  gas: "Transportation",
  fuel: "Transportation",
  uber: "Transportation",
  lyft: "Transportation",
  taxi: "Transportation",
  parking: "Transportation",
  "public transport": "Transportation",
  bus: "Transportation",
  train: "Transportation",
  subway: "Transportation",
  metro: "Transportation",
  airline: "Travel",
  hotel: "Travel",
  airbnb: "Travel",
  booking: "Travel",
  amazon: "Shopping",
  walmart: "Shopping",
  target: "Shopping",
  costco: "Shopping",
  "best buy": "Shopping",
  apple: "Technology",
  google: "Technology",
  microsoft: "Technology",
  netflix: "Entertainment",
  spotify: "Entertainment",
  hulu: "Entertainment",
  disney: "Entertainment",
  youtube: "Entertainment",
  movie: "Entertainment",
  theater: "Entertainment",
  concert: "Entertainment",
  gym: "Sports & Fitness",
  fitness: "Sports & Fitness",
  workout: "Sports & Fitness",
  pharmacy: "Healthcare",
  doctor: "Healthcare",
  hospital: "Healthcare",
  clinic: "Healthcare",
  dental: "Healthcare",
  vision: "Healthcare",
  insurance: "Insurance",
  bank: "Investment",
  "credit union": "Investment",
  atm: "Investment",
  utility: "Utilities",
  electric: "Utilities",
  water: "Utilities",
  "gas company": "Utilities",
  internet: "Utilities",
  phone: "Utilities",
  mobile: "Utilities",
  education: "Education",
  school: "Education",
  university: "Education",
  college: "Education",
  bookstore: "Books & Media",
  library: "Books & Media",
  pet: "Pets",
  veterinary: "Pets",
  vet: "Pets",
  gift: "Gifts",
  salon: "Personal Care",
  spa: "Personal Care",
  beauty: "Personal Care",
  hair: "Personal Care",
  nail: "Personal Care",
  "home depot": "Home & Garden",
  lowes: "Home & Garden",
  hardware: "Home & Garden",
  garden: "Home & Garden",
  legal: "Legal",
  lawyer: "Legal",
  attorney: "Legal",
  tax: "Taxes",
  irs: "Taxes",
};

/**
 * Find the merchant category based on the transaction category
 * @param {string} category - The transaction category
 * @returns {string} The merchant category
 */
export function findMerchantCategory(category) {
  if (!category) return "Others";

  const lowerCategory = category.toLowerCase();

  // Direct match
  if (MERCHANT_CATEGORIES[lowerCategory]) {
    return MERCHANT_CATEGORIES[lowerCategory];
  }

  // Partial match
  for (const [key, value] of Object.entries(MERCHANT_CATEGORIES)) {
    if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
      return value;
    }
  }

  return "Others";
}

/**
 * Get all available categories
 * @returns {string[]} Array of all categories
 */
export function getAllCategories() {
  return [...ALL_CATEGORIES];
}

/**
 * Get category by name
 * @param {string} name - Category name
 * @returns {string|null} Category if found, null otherwise
 */
export function getCategoryByName(name) {
  if (!name) return null;

  const lowerName = name.toLowerCase();
  return ALL_CATEGORIES.find((cat) => cat.toLowerCase() === lowerName) || null;
}

/**
 * Validate if a category is valid
 * @param {string} category - Category to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidCategory(category) {
  if (!category) return false;
  return ALL_CATEGORIES.some(
    (cat) => cat.toLowerCase() === category.toLowerCase()
  );
}

export default {
  findMerchantCategory,
  getAllCategories,
  getCategoryByName,
  isValidCategory,
  ALL_CATEGORIES,
  MERCHANT_CATEGORIES,
};
