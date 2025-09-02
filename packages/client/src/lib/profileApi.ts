const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "";

// Simple token utility - in production, this should come from a proper auth context
const getAuthToken = (): string | null => {
  // Try to get token from sessionStorage (as used in useAuth)
  return sessionStorage.getItem("meal_mint_token");
};

export interface UserProfile {
  monthlyBudget?: number;
  monthlyIncome?: number;
  expensePreferences?: {
    categories?: Record<string, number>;
    diningOut?: string;
    cuisineTypes?: string[];
  };
  savingsGoals?: {
    goalAmount?: number;
    targetDate?: string;
  };
  lifestylePreferences?: {
    diningStyle?: string[];
    hobbies?: string[];
    priceRange?: string;
  };
}

export interface ProfileResponse {
  message: string;
  profileId: string;
  profileComplete: boolean;
}

/**
 * Fetch user profile data
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = getAuthToken();
    if (!token) {
      // For now, return empty profile if no token
      // In production, this should redirect to login
      console.warn("No auth token found, returning empty profile");
      return {};
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Profile not found - return empty profile
        return {};
      }
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Return empty profile on error for now
    return {};
  }
};

/**
 * Create or update user profile
 */
export const createOrUpdateProfile = async (
  profileData: Partial<UserProfile>
): Promise<ProfileResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to save profile: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};
