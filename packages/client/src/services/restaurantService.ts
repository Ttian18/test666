import {
  GetRestaurantRecommendationsResponse,
  GetRestaurantRecommendationsRequest,
  Recommendation,
} from "schema";

interface RestaurantAPIResponse {
  message: string;
  location: string;
  personalized: boolean;
  recommendations: Recommendation[];
  query: string;
}

interface RestaurantAPIError {
  error: string;
  code?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ZhongcaoResult {
  id: number;
  user_id: number;
  originalFilename: string;
  restaurantName: string;
  dishName?: string | null;
  address?: string | null;
  description: string;
  socialMediaHandle?: string | null;
  processedAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
}

export interface ZhongcaoUploadResponse {
  message: string;
  result: ZhongcaoResult;
  extractedInfo: {
    restaurant_name: string;
    dish_name?: string | null;
    address?: string | null;
    description: string;
    social_media_handle?: string | null;
  };
  restaurant_name: string;
  dish_name?: string | null;
  address?: string | null;
  description: string;
  social_media_handle?: string | null;
}

class RestaurantService {
  private static readonly API_BASE = import.meta.env.VITE_API_URL || "";

  /**
   * Upload and analyze a restaurant image from social media
   * @param file - The image file to upload
   * @param token - Authentication token (required)
   * @returns Promise with extracted restaurant information
   */
  static async uploadZhongcaoImage(
    file: File,
    token: string
  ): Promise<ZhongcaoUploadResponse> {
    const formData = new FormData();
    formData.append("image", file);

    const headers: Record<string, string> = {
      "x-auth-token": token,
    };

    console.log(
      "🔍 Uploading zhongcao image to:",
      `${this.API_BASE}/api/restaurants/zhongcao/social-upload`
    );

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/zhongcao/social-upload`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      console.error(
        "❌ Upload Error - Status:",
        response.status,
        "StatusText:",
        response.statusText
      );
      console.error("❌ Upload Error - URL:", response.url);

      let errorMessage = "Failed to upload and analyze image";
      try {
        const error = await response.json();
        console.error("❌ Upload Error - Response:", error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        console.error("❌ Could not parse upload error response:", parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * Get all zhongcao results for the authenticated user
   * @param token - Authentication token (required)
   * @returns Promise with array of zhongcao results
   */
  static async getAllZhongcaoResults(token: string): Promise<ZhongcaoResult[]> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    console.log(
      "🔍 Fetching zhongcao results from:",
      `${this.API_BASE}/api/restaurants/zhongcao`
    );

    const response = await fetch(`${this.API_BASE}/api/restaurants/zhongcao`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error(
        "❌ API Error - Status:",
        response.status,
        "StatusText:",
        response.statusText
      );
      console.error("❌ API Error - URL:", response.url);

      let errorMessage = "Failed to fetch zhongcao results";
      try {
        const error = await response.json();
        console.error("❌ API Error - Response:", error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        console.error("❌ Could not parse error response:", parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * Get a specific zhongcao result by ID
   * @param id - The zhongcao result ID
   * @param token - Authentication token (required)
   * @returns Promise with zhongcao result
   */
  static async getZhongcaoResultById(
    id: number,
    token: string
  ): Promise<ZhongcaoResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    console.log(
      "🔍 Fetching zhongcao result by ID from:",
      `${this.API_BASE}/api/restaurants/zhongcao/${id}`
    );

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/zhongcao/${id}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch zhongcao result");
    }

    return await response.json();
  }

  /**
   * Update a zhongcao result
   * @param id - The zhongcao result ID
   * @param data - The data to update
   * @param token - Authentication token (required)
   * @returns Promise with updated zhongcao result
   */
  static async updateZhongcaoResult(
    id: number,
    data: {
      restaurantName?: string;
      dishName?: string | null;
      address?: string | null;
      description?: string;
      socialMediaHandle?: string | null;
    },
    token: string
  ): Promise<ZhongcaoResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    console.log(
      "🔍 Updating zhongcao result at:",
      `${this.API_BASE}/api/restaurants/zhongcao/${id}`
    );

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/zhongcao/${id}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update zhongcao result");
    }

    return await response.json();
  }

  /**
   * Delete a zhongcao result
   * @param id - The zhongcao result ID
   * @param token - Authentication token (required)
   * @returns Promise that resolves when deletion is complete
   */
  static async deleteZhongcaoResult(id: number, token: string): Promise<void> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    console.log(
      "🔍 Deleting zhongcao result at:",
      `${this.API_BASE}/api/restaurants/zhongcao/${id}`
    );

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/zhongcao/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete zhongcao result");
    }
  }

  /**
   * Get personalized restaurant recommendations based on location and user preferences
   * @param query - The search query (e.g., "restaurants in San Francisco")
   * @param token - Authentication token (required for personalized recommendations)
   * @param userData - Optional user data for better personalization
   * @returns Promise with restaurant recommendations
   */
  static async getRestaurantRecommendations(
    query: string,
    token: string,
    userData?: GetRestaurantRecommendationsRequest["userData"]
  ): Promise<GetRestaurantRecommendationsResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    const response = await fetch(
      `${this.API_BASE}/api/restaurants?location=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error: RestaurantAPIError = await response.json();
      throw new Error(
        error.error || "Failed to get restaurant recommendations"
      );
    }

    const data: RestaurantAPIResponse = await response.json();

    // Transform the response to match the expected schema
    return {
      query: data.query,
      answer: data.recommendations,
      rawAnswer: data.query,
    };
  }

  /**
   * Get restaurant recommendations with a simple location string
   * @param location - The location to search for restaurants
   * @param token - Authentication token (required)
   * @returns Promise with restaurant recommendations
   */
  static async getRestaurantRecommendationsByLocation(
    location: string,
    token: string
  ): Promise<GetRestaurantRecommendationsResponse> {
    const query = `I'm looking for restaurant recommendations in ${location}. Please suggest good places to eat.`;
    return this.getRestaurantRecommendations(query, token);
  }

  /**
   * Get user's restaurant search history
   * @param token - Authentication token (required)
   * @param options - Query options
   * @returns Promise with search history
   */
  static async getSearchHistory(
    token: string,
    options: {
      limit?: number;
      offset?: number;
      days?: number;
    } = {}
  ): Promise<{
    searchHistory: Array<{
      id: number;
      search_query: string;
      location: string | null;
      result_count: number;
      created_at: string;
      updated_at: string;
    }>;
    stats: {
      totalSearches: number;
      uniqueQueries: number;
      mostSearchedLocation: string | null;
      lastSearchDate: string | null;
    };
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append("limit", options.limit.toString());
    if (options.offset) queryParams.append("offset", options.offset.toString());
    if (options.days) queryParams.append("days", options.days.toString());

    const response = await fetch(
      `${
        this.API_BASE
      }/api/restaurants/search-history?${queryParams.toString()}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error: RestaurantAPIError = await response.json();
      throw new Error(error.error || "Failed to get search history");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get specific search history details with full results
   * @param id - Search history ID
   * @param token - Authentication token (required)
   * @returns Promise with search history details
   */
  static async getSearchHistoryDetails(
    id: number,
    token: string
  ): Promise<{
    id: number;
    search_query: string;
    location: string | null;
    search_results: any[];
    result_count: number;
    user_preferences: any;
    created_at: string;
    updated_at: string;
  }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/search-history/${id}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error: RestaurantAPIError = await response.json();
      throw new Error(error.error || "Failed to get search history details");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Delete specific search history
   * @param id - Search history ID
   * @param token - Authentication token (required)
   * @returns Promise<void>
   */
  static async deleteSearchHistory(id: number, token: string): Promise<void> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/search-history/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      const error: RestaurantAPIError = await response.json();
      throw new Error(error.error || "Failed to delete search history");
    }
  }

  /**
   * Update specific search history
   * @param id - Search history ID
   * @param updateData - Data to update
   * @param token - Authentication token (required)
   * @returns Promise with updated search history
   */
  static async updateSearchHistory(
    id: number,
    updateData: {
      search_query?: string;
      location?: string;
      search_results?: any[];
      result_count?: number;
      user_preferences?: any;
    },
    token: string
  ): Promise<{
    id: number;
    search_query: string;
    location: string | null;
    result_count: number;
    created_at: string;
    updated_at: string;
  }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/search-history/${id}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const error: RestaurantAPIError = await response.json();
      throw new Error(error.error || "Failed to update search history");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Search within search history
   * @param searchTerm - Term to search for
   * @param token - Authentication token (required)
   * @param options - Search options
   * @returns Promise with search results
   */
  static async searchInHistory(
    searchTerm: string,
    token: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    searchResults: Array<{
      id: number;
      search_query: string;
      location: string | null;
      result_count: number;
      created_at: string;
      updated_at: string;
    }>;
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/search-history/search`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          searchTerm,
          ...options,
        }),
      }
    );

    if (!response.ok) {
      const error: RestaurantAPIError = await response.json();
      throw new Error(error.error || "Failed to search in history");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get search history by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param token - Authentication token (required)
   * @param options - Query options
   * @returns Promise with search history
   */
  static async getSearchHistoryByDateRange(
    startDate: string,
    endDate: string,
    token: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    searchHistory: Array<{
      id: number;
      search_query: string;
      location: string | null;
      result_count: number;
      created_at: string;
      updated_at: string;
    }>;
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/search-history/date-range`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          startDate,
          endDate,
          ...options,
        }),
      }
    );

    if (!response.ok) {
      const error: RestaurantAPIError = await response.json();
      throw new Error(
        error.error || "Failed to get search history by date range"
      );
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Bulk delete search history records
   * @param ids - Array of IDs to delete
   * @param token - Authentication token (required)
   * @returns Promise with deletion count
   */
  static async bulkDeleteSearchHistory(
    ids: number[],
    token: string
  ): Promise<{ deletedCount: number }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/search-history/bulk-delete`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ ids }),
      }
    );

    if (!response.ok) {
      const error: RestaurantAPIError = await response.json();
      throw new Error(error.error || "Failed to bulk delete search history");
    }

    const data = await response.json();
    return { deletedCount: data.deletedCount };
  }

  /**
   * Delete all user's search history
   * @param token - Authentication token (required)
   * @returns Promise with deletion count
   */
  static async deleteAllSearchHistory(
    token: string
  ): Promise<{ deletedCount: number }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    const response = await fetch(
      `${this.API_BASE}/api/restaurants/search-history`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      const error: RestaurantAPIError = await response.json();
      throw new Error(error.error || "Failed to delete all search history");
    }

    const data = await response.json();
    return { deletedCount: data.deletedCount };
  }
}

export default RestaurantService;
