import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// JWT Token interface
interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

// Register form data interface
interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// User interface
interface User {
  id: string;
  email: string;
  name: string;
  isNewUser?: boolean;
  profile: {
    monthlyBudget: number | null;
    income: number | null;
    savingsGoal: number | null;
    hasCompletedQuestionnaire?: boolean;
    hasSeenIntro?: boolean;
    preferences: Record<string, any>;
  };
}

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// Secure token storage using httpOnly cookies simulation
// In production, use httpOnly cookies on the server side
class SecureTokenStorage {
  private static readonly TOKEN_KEY = "meal_mint_token";
  private static readonly REFRESH_TOKEN_KEY = "meal_mint_refresh_token";

  static setTokens(token: string, refreshToken: string): void {
    // In production, these should be httpOnly cookies set by the server
    // For now, we'll use sessionStorage for access token (more secure than localStorage)
    // and localStorage for refresh token with encryption
    sessionStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, this.encrypt(refreshToken));
  }

  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    const encrypted = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return encrypted ? this.decrypt(encrypted) : null;
  }

  static clearTokens(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Simple encryption/decryption for demo purposes
  // In production, use proper encryption libraries
  private static encrypt(text: string): string {
    return btoa(text);
  }

  private static decrypt(encrypted: string): string {
    return atob(encrypted);
  }
}

// JWT utilities
class JWTUtils {
  static decodeToken(token: string): JWTPayload | null {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const now = Date.now() / 1000;
    return payload.exp < now;
  }

  static isTokenExpiringSoon(token: string, minutesThreshold = 5): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const now = Date.now() / 1000;
    const threshold = minutesThreshold * 60;
    return payload.exp < now + threshold;
  }
}

// Test users for development
const TEST_USERS = [
  {
    email: "demo@mealmint.ai",
    password: "demo123",
    id: "demo-001",
    name: "Demo User",
    isNewUser: true, // First-time user - needs onboarding
    profile: {
      monthlyBudget: null, // Not set yet - needs questionnaire
      income: null,
      savingsGoal: null,
      hasCompletedQuestionnaire: false,
      hasSeenIntro: false,
      preferences: { currency: "USD", theme: "light" },
    },
  },
  {
    email: "john@example.com",
    password: "password",
    id: "user-001",
    name: "John Doe",
    isNewUser: false, // Existing user
    profile: {
      monthlyBudget: 3000,
      income: 5000,
      savingsGoal: 10000,
      hasCompletedQuestionnaire: true,
      hasSeenIntro: true,
      preferences: { currency: "USD", theme: "dark" },
    },
  },
  {
    email: "sarah@test.com",
    password: "test123",
    id: "user-002",
    name: "Sarah Johnson",
    isNewUser: false, // Existing user
    profile: {
      monthlyBudget: 2000,
      income: 3500,
      savingsGoal: 5000,
      hasCompletedQuestionnaire: true,
      hasSeenIntro: true,
      preferences: { currency: "USD", theme: "light" },
    },
  },
  {
    email: "admin@mealmint.ai",
    password: "admin",
    id: "admin-001",
    name: "Admin User",
    isNewUser: false, // Existing user
    profile: {
      monthlyBudget: 5000,
      income: 8000,
      savingsGoal: 15000,
      hasCompletedQuestionnaire: true,
      hasSeenIntro: true,
      preferences: { currency: "USD", theme: "light", role: "admin" },
    },
  },
];

// Mock API service - replace with real backend calls
class AuthService {
  private static readonly API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5001";

  static async login(
    email: string,
    password: string
  ): Promise<{ token: string; refreshToken: string; user: User }> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // Create user object from login response
      const user: User = {
        id: data.userId.toString(),
        email: email,
        name: data.name || email.split("@")[0], // Use name from backend, fallback to email prefix
        isNewUser: !data.profileComplete,
        profile: {
          monthlyBudget: null,
          income: null,
          savingsGoal: null,
          hasCompletedQuestionnaire: data.profileComplete || false,
          hasSeenIntro: data.profileComplete || false,
          preferences: { currency: "USD", theme: "light" },
        },
      };

      // For now, create mock refresh token (in production, this comes from backend)
      const mockRefreshToken = `refresh_${btoa(Math.random().toString())}`;

      return {
        token: data.token,
        refreshToken: mockRefreshToken,
        user: user,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  static async register(
    formData: RegisterFormData
  ): Promise<{ token: string; refreshToken: string; user: User }> {
  

    // In production, this will make a real API call to the backend
    try {
      const response = await fetch(`${this.API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();

      // Create user object from registration response
      const newUser: User = {
        id: data.userId.toString(),
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        isNewUser: true, // New registered users need onboarding
        profile: {
          monthlyBudget: null,
          income: null,
          savingsGoal: null,
          hasCompletedQuestionnaire: false,
          hasSeenIntro: false,
          preferences: { currency: "USD", theme: "light" },
        },
      };

      // For now, create mock refresh token (in production, this comes from backend)
      const mockRefreshToken = `refresh_${btoa(Math.random().toString())}`;

      return {
        token: data.token,
        refreshToken: mockRefreshToken,
        user: newUser,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockPayload = {
      userId: "12345",
      email: "user@example.com",
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iat: Math.floor(Date.now() / 1000),
    };

    const newToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`;
    const newRefreshToken = `refresh_${btoa(Math.random().toString())}`;

    return { token: newToken, refreshToken: newRefreshToken };
  }

  static async logout(): Promise<void> {
    // Mock implementation - in production, invalidate tokens on server
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  static async validateToken(token: string): Promise<User | null> {
    // Mock implementation
    if (JWTUtils.isTokenExpired(token)) return null;

    // Add slight delay for demo user to show loading effect on app initialization
    const payload = JWTUtils.decodeToken(token);
    if (!payload) return null;

    const isDemoUser = payload?.email === "demo@mealmint.ai";
    const delay = isDemoUser ? 1000 : 200; // 1 second for demo user, 200ms for others
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Find the test user that matches the token
    const testUser = TEST_USERS.find(
      (user) => user.id === payload.userId && user.email === payload.email
    );

    if (!testUser) return null;

    return {
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
      isNewUser: testUser.isNewUser || false,
      profile: testUser.profile,
    };
  }
}

// Main authentication hook
export const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  // Auto token refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = SecureTokenStorage.getToken();
      if (token && JWTUtils.isTokenExpiringSoon(token)) {
        await refreshTokens();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const token = SecureTokenStorage.getToken();
      if (!token) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      if (JWTUtils.isTokenExpired(token)) {
        await refreshTokens();
        return;
      }

      const user = await AuthService.validateToken(token);
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          token,
        });
      } else {
        await logout();
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      await logout();
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const { token, refreshToken, user } = await AuthService.login(
        email,
        password
      );

      SecureTokenStorage.setTokens(token, refreshToken);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        token,
      });

      // Handle new user onboarding
      if (user.isNewUser) {
        // Clear any existing onboarding state for new users
        localStorage.removeItem("hasSeenIntro");
        localStorage.removeItem("hasCompletedQuestionnaire");
        localStorage.removeItem("userProfile");
      } else {
        // Store user preferences (migrate from localStorage) for existing users
        const existingProfile = localStorage.getItem("userProfile");
        if (existingProfile) {
          const profile = JSON.parse(existingProfile);
          // In production, sync this with backend
          user.profile = { ...user.profile, ...profile };
        }
      }

      return { success: true, user };
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }, []);

  const register = useCallback(async (formData: RegisterFormData) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      // 1. Validate request using Zod schema
      // 2. Check for existing user
      // 3. Hash password with bcrypt
      // 4. Create user in database
      // 5. Generate JWT token
      // 6. Return success response

      const { token, refreshToken, user } = await AuthService.register(
        formData
      );

      SecureTokenStorage.setTokens(token, refreshToken);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        token,
      });

      // New users always need onboarding
      localStorage.removeItem("hasSeenIntro");
      localStorage.removeItem("hasCompletedQuestionnaire");
      localStorage.removeItem("userProfile");

      return { success: true, user };
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      SecureTokenStorage.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null,
      });

      // Safe navigation - only navigate if router context is available
      try {
        navigate("/login");
      } catch (navError) {
        console.warn("Navigation not available during logout:", navError);
        // Fallback: reload the page to reset the app state
        window.location.href = "/login";
      }
    }
  }, [navigate]);

  const refreshTokens = useCallback(async () => {
    try {
      const refreshToken = SecureTokenStorage.getRefreshToken();
      if (!refreshToken) {
        await logout();
        return;
      }

      const { token: newToken, refreshToken: newRefreshToken } =
        await AuthService.refreshToken(refreshToken);

      SecureTokenStorage.setTokens(newToken, newRefreshToken);

      const user = await AuthService.validateToken(newToken);
      if (user) {
        setAuthState((prev) => ({ ...prev, token: newToken, user }));
        return true;
      } else {
        await logout();
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      await logout();
      return false;
    }
  }, [logout]);

  const updateProfile = useCallback(
    async (profileData: Partial<User["profile"]>) => {
      if (!authState.user) return;

      const updatedUser = {
        ...authState.user,
        profile: { ...authState.user.profile, ...profileData },
      };

      setAuthState((prev) => ({ ...prev, user: updatedUser }));

      // In production, sync with backend
      // await updateUserProfile(updatedUser.profile);
    },
    [authState.user]
  );

  return {
    ...authState,
    login,
    register,
    logout,
    refreshTokens,
    updateProfile,
    isExpired: authState.token
      ? JWTUtils.isTokenExpired(authState.token)
      : true,
  };
};

export default useAuth;
