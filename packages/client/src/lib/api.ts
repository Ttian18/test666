import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
  timeout: 30000, // 30 seconds timeout for file uploads
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating?: number;
  priceLevel?: number;
  types?: string[];
}

export interface MenuRecommendation {
  menuInfo: {
    items: Array<{
      name: string;
      price: number;
      description?: string;
    }>;
  };
  recommendation: {
    // LLM response structure
    picks?: Array<{
      name: string;
      quantity: number;
      estimatedCalories?: number;
      reason?: string;
    }>;
    estimatedTotal?: number;
    estimatedTotalCalories?: number;
    notes?: string;
    filteredOut?: Array<{
      name: string;
      reason: string;
    }>;
    relaxedHard?: boolean;
    calorie_relaxed?: boolean;

    // Fallback budget service structure
    total?: number;
    currency?: string;
    items?: Array<{
      name: string;
      qty: number;
      unit_price: number;
      subtotal: number;
      estimatedCalories?: number;
    }>;
    rationale?: string;
    budget?: number;
    withinBudget?: boolean;
  };
  tagsApplied?: string[];
  hardConstraints?: string[];
  softPreferences?: string[];
  caloriesApplied?: {
    maxPerPerson: number;
  };
  removedByTags?: number;
  filterDebug?: Array<{
    name: string;
    reason: string;
    tag: string;
  }>;
  guardViolations?: Array<{
    name: string;
    reason: string;
    phase: string;
  }>;
  cached?: boolean;
}

export interface RecommendationPayload {
  budget: number;
  tags?: string[];
}

/**
 * Fetch restaurants by location
 */
export const fetchRestaurants = async (
  location: string
): Promise<Restaurant[]> => {
  try {
    const response = await api.get(
      `/restaurants?location=${encodeURIComponent(location)}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    // Return empty array for now since this endpoint might not exist
    return [];
  }
};

/**
 * Upload menu photo and get AI recommendations
 */
export const recommendFromUpload = async (
  file: File,
  payload: RecommendationPayload
): Promise<MenuRecommendation> => {
  const formData = new FormData();

  // Add file
  formData.append("image", file);

  // Add other fields
  formData.append("budget", payload.budget.toString());

  if (payload.tags && payload.tags.length > 0) {
    formData.append("tags", JSON.stringify(payload.tags));
  }



  const response = await api.post(
    "/restaurants/menu-analysis/recommend",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/**
 * Get the last cached recommendation
 */
export const getLastRecommendation =
  async (): Promise<MenuRecommendation | null> => {
    try {
      const response = await api.get("/restaurants/menu-analysis/last");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // No cached recommendation
      }
      throw error;
    }
  };

/**
 * Clear the recommendation cache
 */
export const clearCache = async (): Promise<void> => {
  await api.delete("/restaurants/menu-analysis/cache");
};
