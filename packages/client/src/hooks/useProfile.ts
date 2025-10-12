import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
console.log("🌐 useProfile: API_BASE_URL configured as:", API_BASE_URL);

export interface UserProfile {
  basicInfo: any;
  dietaryPreferences: any;
  financialSettings: any;
  notificationSettings: any;
  privacySettings: any;
  completionPercentage: number;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuthContext();

  console.log("🔍 useProfile: AuthContext state:", {
    hasUser: !!user,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + "..." : "NO TOKEN",
  });

  const fetchProfile = async () => {
    if (!token) {
      console.warn("⚠️ useProfile: No token available, cannot fetch profile");
      return;
    }

    try {
      setLoading(true);
      const headers = {
        "x-auth-token": token,
        "Content-Type": "application/json",
      };

      console.log(
        "🔍 useProfile: Fetching profile with token:",
        token.substring(0, 20) + "..."
      );
      console.log(
        "🔍 useProfile: API URL:",
        `${API_BASE_URL}/api/users/profile`
      );
      console.log("🔍 useProfile: Request headers:", headers);

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "❌ useProfile: Failed to fetch profile:",
          response.status,
          errorData
        );
        throw new Error(
          `Failed to fetch profile: ${response.status} ${
            errorData.message || ""
          }`
        );
      }

      const data = await response.json();
      console.log("✅ useProfile: Profile fetched successfully");
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (section: string, data: any) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ section, data }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // 重新获取最新资料
      await fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!token) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/avatar`, {
        method: "POST",
        headers: {
          "x-auth-token": token,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchProfile();
    }
  }, [user, token]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
};
