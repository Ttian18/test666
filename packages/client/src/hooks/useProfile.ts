import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

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

  const fetchProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch("/api/users/profile", {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
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
      const response = await fetch("/api/users/profile", {
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
      const response = await fetch("/api/users/profile/avatar", {
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
