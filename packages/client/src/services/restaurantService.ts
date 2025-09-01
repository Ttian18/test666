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
  private static readonly API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5001";

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
    formData.append('image', file);

    const headers: Record<string, string> = {
      "x-auth-token": token,
    };

    const response = await fetch(
      `${this.API_BASE}/zhongcao/social-upload`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload and analyze image");
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

    const response = await fetch(`${this.API_BASE}/zhongcao`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch zhongcao results");
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

    const response = await fetch(`${this.API_BASE}/zhongcao/${id}`, {
      method: "GET",
      headers,
    });

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

    const response = await fetch(`${this.API_BASE}/zhongcao/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

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

    const response = await fetch(`${this.API_BASE}/zhongcao/${id}`, {
      method: "DELETE",
      headers,
    });

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
      `${this.API_BASE}/restaurants?location=${encodeURIComponent(query)}`,
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
}

export default RestaurantService;
