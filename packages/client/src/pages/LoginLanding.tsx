import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import LandingNavigation from "@/components/LandingNavigation";

const LoginLanding: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async () => {
    try {
      console.log("🔐 LoginLanding.handleSubmit called:", {
        email: credentials.email,
        rememberMe,
        hasPassword: !!credentials.password,
      });
      setError("");
      const result = await login(
        credentials.email,
        credentials.password,
        rememberMe
      );

      if (result.success) {
        console.log("✅ Login successful, redirecting user");
        // For new users, let ProtectedRoute handle the onboarding flow
        // For existing users, go directly to home
        const redirectPath = result.user?.isNewUser ? "/intro" : "/home";
        navigate(redirectPath);
      } else {
        console.log("❌ Login failed:", result.error);
        setError(result.error || "Login failed");
      }
    } catch (err) {
      console.log("❌ Login error:", err);
      setError("An unexpected error occurred");
    }
  };

  const fillDemoCredentials = () => {
    setCredentials({
      email: "demo@mealmint.ai",
      password: "demo123",
    });
    setError("");
  };

  return (
    <div className="min-h-screen page-background-landing">
      <LandingNavigation />

      <div className="max-w-md mx-auto px-6 pt-32 pb-20">
        <div className="luxury-form">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your MealMint AI account</p>
          </div>

          {/* Test Credentials Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 mb-1">
                  Demo Mode
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Use these test credentials to explore the app:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="font-mono text-blue-800">
                      <div>
                        <strong>Email:</strong> demo@mealmint.ai
                      </div>
                      <div>
                        <strong>Password:</strong> demo123
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={fillDemoCredentials}
                  className="mt-3 text-xs luxury-button"
                  size="sm"
                >
                  Fill Demo Credentials
                </Button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="luxury-input pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="luxury-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={(e) => {
                    console.log(
                      "☑️ Remember me checkbox changed:",
                      e.target.checked
                    );
                    setRememberMe(e.target.checked);
                  }}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </button>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleSubmit}
                className="luxury-button-primary w-full h-12"
                disabled={
                  !credentials.email || !credentials.password || isLoading
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <button
                  onClick={() => navigate("/signup")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={() => navigate("/")} className="luxury-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Or continue with</p>
              <div className="grid grid-cols-2 gap-4">
                <Button className="luxury-button">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button className="luxury-button">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLanding;
