import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { OnboardingUtils } from '@/utils/onboarding';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  skipOnboarding?: boolean; // Allow bypassing onboarding for specific routes
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  skipOnboarding = false
}) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
  const [showDemoLoading, setShowDemoLoading] = useState(true);

  useEffect(() => {
    const updateOnboardingStatus = () => {
      // Check onboarding status from localStorage and user profile
      const seenIntro = localStorage.getItem('hasSeenIntro') === 'true';
      const completedQuestionnaire = localStorage.getItem('hasCompletedQuestionnaire') === 'true';
      
      // For new users, check both localStorage (for current session) and profile settings
      if (user?.isNewUser) {
        // Prioritize localStorage (current session) over profile settings
        setHasSeenIntro(seenIntro || user.profile?.hasSeenIntro || false);
        setHasCompletedQuestionnaire(completedQuestionnaire || user.profile?.hasCompletedQuestionnaire || false);
      } else {
        setHasSeenIntro(seenIntro);
        setHasCompletedQuestionnaire(completedQuestionnaire);
      }
    };

    // Initial check
    updateOnboardingStatus();

    // Debug: Log initial state
    if (user?.email === 'demo@mealmint.ai') {
      console.log('🔍 ProtectedRoute - Initial onboarding check for demo user:', {
        user: user?.email,
        userProfile: user?.profile,
        localStorage: OnboardingUtils.getOnboardingStatus(),
        currentPath: location.pathname
      });
    }

    // Listen for localStorage changes (for when user completes onboarding in same session)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hasSeenIntro' || e.key === 'hasCompletedQuestionnaire') {
        console.log('🔄 ProtectedRoute - Storage change detected:', e.key, e.newValue);
        updateOnboardingStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab localStorage changes)
    const handleCustomStorageChange = () => {
      console.log('🔄 ProtectedRoute - Custom onboarding update event received');
      updateOnboardingStatus();
    };
    window.addEventListener('onboardingUpdate', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('onboardingUpdate', handleCustomStorageChange);
    };
  }, [user]);

  // Demo loading timer - show loading for 2 seconds then continue
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const timer = setTimeout(() => {
        setShowDemoLoading(false);
      }, 2000); // Show demo loading for 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

  // Show loading spinner while auth is being verified or during demo loading
  if (isLoading || (isAuthenticated && showDemoLoading)) {
    return (
      <div className="min-h-screen page-background-landing flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* Enhanced loading animation */}
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-20 h-20 mx-auto border-4 border-blue-200/30 border-t-blue-500 rounded-full animate-spin" />
            {/* Inner pulsing ring */}
            <div className="absolute inset-2 w-16 h-16 mx-auto border-2 border-transparent border-r-blue-600 rounded-full animate-ping" />
            {/* Center dot */}
            <div className="absolute inset-8 w-4 h-4 mx-auto bg-blue-500 rounded-full animate-pulse" />
          </div>
          
          {/* Loading text with gradient */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Securing your session...
            </h2>
            <p className="text-gray-600 text-sm">
              {user?.isNewUser ? 'Preparing your onboarding experience' : 'Verifying your credentials'}
            </p>
          </div>
          
          {/* Animated dots */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse animation-delay-300" />
            <div className="w-2 h-2 bg-blue-700 rounded-full animate-pulse animation-delay-500" />
          </div>
          
          {/* Demo user specific message */}
          {user?.isNewUser && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-sm mx-auto">
              <p className="text-blue-800 text-sm">
                🎉 <strong>Demo Mode:</strong> Extended loading to showcase the authentication experience
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect authenticated users away from auth pages
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || '/home';
    return <Navigate to={from} replace />;
  }

  // Handle onboarding flow for authenticated users
  if (requireAuth && isAuthenticated && !skipOnboarding) {
    const currentPath = location.pathname;
    
    // Debug: Log onboarding decision
    if (user?.email === 'demo@mealmint.ai') {
      console.log('🚦 ProtectedRoute - Onboarding decision for demo user:', {
        currentPath,
        hasSeenIntro,
        hasCompletedQuestionnaire,
        decision: !hasSeenIntro ? 'redirect to intro' : !hasCompletedQuestionnaire ? 'redirect to questionnaire' : 'allow access'
      });
    }
    
    // Don't redirect if already on onboarding pages
    if (currentPath === '/intro' || currentPath === '/questionnaire') {
      return <>{children}</>;
    }
    
    // For new users or users who haven't seen intro, show intro first
    if (!hasSeenIntro) {
      console.log('🔀 ProtectedRoute - Redirecting to intro (hasSeenIntro: false)');
      return <Navigate to="/intro" replace />;
    }
    
    // After intro, check if questionnaire is completed
    if (!hasCompletedQuestionnaire) {
      console.log('🔀 ProtectedRoute - Redirecting to questionnaire (hasCompletedQuestionnaire: false)');
      return <Navigate to="/questionnaire" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
