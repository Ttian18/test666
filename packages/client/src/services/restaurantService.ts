import {
  GetRestaurantRecommendationsResponse,
  GetRestaurantRecommendationsRequest,
  Recommendation,
} from "@your-project/schema";

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

class RestaurantService {
  private static readonly API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5001";

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

    // Extract location from query for the API call
    const locationMatch = query.match(/in\s+([^.]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : query;

    const response = await fetch(
      `${this.API_BASE}/restaurants?location=${encodeURIComponent(location)}`,
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
