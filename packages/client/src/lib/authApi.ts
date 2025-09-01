import axios from "axios";

// Create axios instance for auth endpoints
const authApi = axios.create({
  baseURL: "/auth", // This will use the Vite proxy to http://localhost:5001
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Auth API Error:", error);
    return Promise.reject(error);
  }
);

// Auth response interfaces
export interface LoginResponse {
  token: string;
  userId: string;
  profileComplete: boolean;
}

export interface RegisterResponse {
  token: string;
  userId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

/**
 * Login user with email and password
 */
export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await authApi.post("/login", credentials);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Login failed. Please try again.");
  }
};

/**
 * Register new user with email and password
 */
export const registerUser = async (
  credentials: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    const response = await authApi.post("/register", credentials);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Registration failed. Please try again.");
  }
};

/**
 * Validate JWT token with backend
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await authApi.get("/validate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export default authApi;
