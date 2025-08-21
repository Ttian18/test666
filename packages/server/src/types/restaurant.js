// Restaurant-related type definitions and interfaces

export const CuisineTypes = {
  CHINESE: "Chinese",
  ITALIAN: "Italian",
  JAPANESE: "Japanese",
  MEXICAN: "Mexican",
  INDIAN: "Indian",
  THAI: "Thai",
  AMERICAN: "American",
  FRENCH: "French",
  MEDITERRANEAN: "Mediterranean",
  KOREAN: "Korean",
  VIETNAMESE: "Vietnamese",
  OTHER: "Other",
};

export const PriceRanges = {
  BUDGET: "$",
  MODERATE: "$$",
  EXPENSIVE: "$$$",
  LUXURY: "$$$$",
};

export const RestaurantFeatures = {
  OUTDOOR_SEATING: "outdoor_seating",
  DELIVERY: "delivery",
  TAKEOUT: "takeout",
  RESERVATIONS: "reservations",
  WHEELCHAIR_ACCESSIBLE: "wheelchair_accessible",
  PARKING: "parking",
  WIFI: "wifi",
  LIVE_MUSIC: "live_music",
  PRIVATE_DINING: "private_dining",
  BAR: "bar",
};

// Restaurant entity interface
export const RestaurantInterface = {
  id: "number",
  name: "string",
  address: "string",
  phone: "string",
  website: "string",
  cuisine: "string",
  priceRange: "string",
  rating: "number",
  hours: "string",
  specialFeatures: "array",
  createdAt: "Date",
  updatedAt: "Date",
};

// Menu item interface
export const MenuItemInterface = {
  id: "number",
  name: "string",
  description: "string",
  price: "number",
  category: "string",
  dietaryInfo: "array",
  allergens: "array",
  calories: "number",
  imageUrl: "string",
};

// Recommendation request interface
export const RecommendationRequestInterface = {
  location: "string",
  cuisine: "string",
  priceRange: "string",
  features: "array",
  budget: "number",
  partySize: "number",
  occasion: "string",
};

// Recommendation response interface
export const RecommendationResponseInterface = {
  recommendations: "array",
  query: "string",
  steps: "array",
  totalResults: "number",
};

// Menu analysis request interface
export const MenuAnalysisRequestInterface = {
  imageBuffer: "Buffer",
  imageMimeType: "string",
  budget: "number",
  userNote: "string",
};

// Menu analysis response interface
export const MenuAnalysisResponseInterface = {
  menuInfo: "object",
  recommendation: "object",
  cached: "boolean",
  timestamp: "Date",
};
