import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

// Register form data interface
interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Auth context type
interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: any; error?: string }>;
  register: (
    formData: RegisterFormData
  ) => Promise<{ success: boolean; user?: any; error?: string }>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  updateProfile: (profileData: any) => Promise<void>;
  isExpired: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
