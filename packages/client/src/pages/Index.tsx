// Welcome page - now redirects based on onboarding status

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    
    if (hasSeenIntro === 'true') {
      navigate('/home');
    } else {
      // This shouldn't normally happen as App.tsx handles routing,
      // but just in case, redirect to intro
      window.location.href = '/';
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
