import {
  GetRestaurantRecommendationsResponse,
  RecommendationErrorResponse,
} from "@your-project/schema";

class RestaurantService {
  private static readonly API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5001";

  /**
   * Get location-based restaurant recommendations
   * @param location - The location to search for restaurants
   * @param token - Optional authentication token for personalized recommendations
   * @returns Promise with restaurant recommendations
   */
  static async getRestaurantRecommendations(
    location: string,
    token?: string
  ): Promise<GetRestaurantRecommendationsResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["x-auth-token"] = token;
    }

    const response = await fetch(
      `${this.API_BASE}/restaurants?location=${encodeURIComponent(location)}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error: RecommendationErrorResponse = await response.json();
      throw new Error(
        error.error || "Failed to get restaurant recommendations"
      );
    }

    const data = await response.json();

    // Transform the response to match the expected schema
    return {
      query: data.query,
      answer: data.recommendations,
      rawAnswer: data.query,
    };
  }
}

export default RestaurantService;
