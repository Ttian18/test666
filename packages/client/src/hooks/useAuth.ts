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
  static readonly TOKEN_KEY = "meal_mint_token";
  static readonly REFRESH_TOKEN_KEY = "meal_mint_refresh_token";

  static setTokens(token: string, refreshToken: string): void {
    // In production, these should be httpOnly cookies set by the server
    // For now, we'll use sessionStorage for access token (more secure than localStorage)
    // and localStorage for refresh token with encryption
    sessionStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, this.encrypt(refreshToken));
  }

  static getToken(): string | null {
    // Check sessionStorage first (for non-remember me), then localStorage (for remember me)
    const sessionToken = sessionStorage.getItem(this.TOKEN_KEY);
    const localToken = localStorage.getItem(this.TOKEN_KEY);
    const token = sessionToken || localToken;

    console.log("🔍 SecureTokenStorage.getToken():", {
      sessionToken: sessionToken ? `${sessionToken.substring(0, 20)}...` : null,
      localToken: localToken ? `${localToken.substring(0, 20)}...` : null,
      finalToken: token ? `${token.substring(0, 20)}...` : null,
      source: sessionToken
        ? "sessionStorage"
        : localToken
        ? "localStorage"
        : "none",
    });

    return token;
  }

  static getRefreshToken(): string | null {
    // Check localStorage first (for remember me), then sessionStorage (for non-remember me)
    const encryptedLocal = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const encryptedSession = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    const encrypted = encryptedLocal || encryptedSession;
    const refreshToken = encrypted ? this.decrypt(encrypted) : null;

    console.log("🔍 SecureTokenStorage.getRefreshToken():", {
      encryptedLocal: encryptedLocal
        ? `${encryptedLocal.substring(0, 20)}...`
        : null,
      encryptedSession: encryptedSession
        ? `${encryptedSession.substring(0, 20)}...`
        : null,
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
      source: encryptedLocal
        ? "localStorage"
        : encryptedSession
        ? "sessionStorage"
        : "none",
    });

    return refreshToken;
  }

  static clearTokens(): void {
    console.log("🧹 SecureTokenStorage.clearTokens() - clearing all tokens");
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    console.log("✅ All tokens cleared from both storage locations");
  }

  // Simple encryption/decryption for demo purposes
  // In production, use proper encryption libraries
  static encrypt(text: string): string {
    return btoa(text);
  }

  static decrypt(encrypted: string): string {
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

// Authentication API service
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
    try {
      console.log("🔍 Validating token with backend API...");

      const response = await fetch(`${this.API_BASE}/auth/validate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        console.log(
          "❌ Token validation failed: API returned",
          response.status
        );
        return null;
      }

      const data = await response.json();
      console.log("✅ Token validation successful:", data);

      // Create user object from validation response
      const user: User = {
        id: data.userId.toString(),
        email: data.email,
        name: data.name || data.email.split("@")[0],
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

      return user;
    } catch (error) {
      console.error("❌ Token validation error:", error);
      return null;
    }
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
      console.log("🚀 Initializing authentication...");

      // Debug: Check localStorage directly
      console.log("🔍 Direct localStorage check:", {
        allLocalStorageKeys: Object.keys(localStorage),
        tokenKey: SecureTokenStorage.TOKEN_KEY,
        refreshTokenKey: SecureTokenStorage.REFRESH_TOKEN_KEY,
        directTokenCheck: localStorage.getItem(SecureTokenStorage.TOKEN_KEY),
        directRefreshCheck: localStorage.getItem(
          SecureTokenStorage.REFRESH_TOKEN_KEY
        ),
      });

      const token = SecureTokenStorage.getToken();
      if (!token) {
        console.log("❌ No token found during initialization");
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      console.log(
        "✅ Token found during initialization:",
        `${token.substring(0, 20)}...`
      );

      if (JWTUtils.isTokenExpired(token)) {
        console.log("⏰ Token expired, attempting refresh...");
        await refreshTokens();
        return;
      }

      console.log("✅ Token valid, validating with server...");
      const user = await AuthService.validateToken(token);
      if (user) {
        console.log("✅ User validation successful:", user.name);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          token,
        });
      } else {
        console.log("❌ User validation failed, logging out");
        await logout();
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      await logout();
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false) => {
      try {
        console.log("🔐 Login attempt started:", { email, rememberMe });
        setAuthState((prev) => ({ ...prev, isLoading: true }));

        const { token, refreshToken, user } = await AuthService.login(
          email,
          password
        );
        console.log("✅ AuthService.login successful:", {
          user: user.name,
          tokenLength: token?.length,
          refreshTokenLength: refreshToken?.length,
        });

        // Clear any existing tokens first to avoid conflicts
        SecureTokenStorage.clearTokens();

        // Store tokens based on remember me preference
        if (rememberMe) {
          // Use localStorage for persistent storage when remember me is checked
          console.log("💾 Storing tokens in localStorage (remember me = true)");
          localStorage.setItem(SecureTokenStorage.TOKEN_KEY, token);
          localStorage.setItem(
            SecureTokenStorage.REFRESH_TOKEN_KEY,
            SecureTokenStorage.encrypt(refreshToken)
          );

          // Verify storage immediately
          const storedToken = localStorage.getItem(
            SecureTokenStorage.TOKEN_KEY
          );
          const storedRefreshToken = localStorage.getItem(
            SecureTokenStorage.REFRESH_TOKEN_KEY
          );
          console.log("✅ Tokens stored in localStorage - Verification:", {
            tokenStored: !!storedToken,
            refreshTokenStored: !!storedRefreshToken,
            tokenKey: SecureTokenStorage.TOKEN_KEY,
            refreshTokenKey: SecureTokenStorage.REFRESH_TOKEN_KEY,
            actualTokenStart: storedToken
              ? storedToken.substring(0, 20) + "..."
              : null,
          });
        } else {
          // Use sessionStorage for temporary storage when remember me is unchecked
          console.log(
            "💾 Storing tokens in sessionStorage (remember me = false)"
          );
          sessionStorage.setItem(SecureTokenStorage.TOKEN_KEY, token);
          sessionStorage.setItem(
            SecureTokenStorage.REFRESH_TOKEN_KEY,
            SecureTokenStorage.encrypt(refreshToken)
          );

          // Verify storage immediately
          const storedToken = sessionStorage.getItem(
            SecureTokenStorage.TOKEN_KEY
          );
          const storedRefreshToken = sessionStorage.getItem(
            SecureTokenStorage.REFRESH_TOKEN_KEY
          );
          console.log("✅ Tokens stored in sessionStorage - Verification:", {
            tokenStored: !!storedToken,
            refreshTokenStored: !!storedRefreshToken,
            actualTokenStart: storedToken
              ? storedToken.substring(0, 20) + "..."
              : null,
          });
        }
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
    },
    []
  );

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

      // Preserve the original storage location (localStorage for remember me, sessionStorage for temporary)
      const wasInLocalStorage =
        localStorage.getItem(SecureTokenStorage.TOKEN_KEY) !== null;

      console.log("🔄 Refreshing tokens, preserving storage location:", {
        wasInLocalStorage,
        storageLocation: wasInLocalStorage ? "localStorage" : "sessionStorage",
      });

      if (wasInLocalStorage) {
        // User had remember me checked, store in localStorage
        console.log(
          "💾 Storing refreshed tokens in localStorage (remember me was true)"
        );
        localStorage.setItem(SecureTokenStorage.TOKEN_KEY, newToken);
        localStorage.setItem(
          SecureTokenStorage.REFRESH_TOKEN_KEY,
          SecureTokenStorage.encrypt(newRefreshToken)
        );
      } else {
        // User didn't have remember me checked, store in sessionStorage
        console.log(
          "💾 Storing refreshed tokens in sessionStorage (remember me was false)"
        );
        sessionStorage.setItem(SecureTokenStorage.TOKEN_KEY, newToken);
        sessionStorage.setItem(
          SecureTokenStorage.REFRESH_TOKEN_KEY,
          SecureTokenStorage.encrypt(newRefreshToken)
        );
      }

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
