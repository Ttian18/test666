import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

import IntroSlides from "./pages/IntroSlides";
import Login from "./pages/Login";
import LoginLanding from "./pages/LoginLanding";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Blogs from "./pages/Blogs";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import Recommendations from "./pages/Recommendations";
import Zhongcao from "./pages/Zhongcao";
import AddExpense from "./pages/AddExpense";
import Questionnaire from "./pages/Questionnaire";
import Profile from "./pages/Profile";
import ButtonShowcase from "./pages/ButtonShowcase";
import StyleShowcase from "./pages/StyleShowcase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);

  useEffect(() => {
    const seenIntro = localStorage.getItem('hasSeenIntro');
    const completedQuestionnaire = localStorage.getItem('hasCompletedQuestionnaire');
    
    setHasSeenIntro(seenIntro === 'true');
    setHasCompletedQuestionnaire(completedQuestionnaire === 'true');
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
              {/* Landing and Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<LoginLanding />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Legacy public routes */}
              <Route 
                path="/legacy-login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/intro" 
                element={
                  <ProtectedRoute skipOnboarding={true}>
                    <IntroSlides />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected app routes */}
              <Route 
                path="/app" 
                element={
                  <ProtectedRoute>
                    {hasSeenIntro ? <Home /> : <IntroSlides />}
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recommendations" 
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/zhongcao" 
                element={
                  <ProtectedRoute>
                    <Zhongcao />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-expense" 
                element={
                  <ProtectedRoute>
                    <AddExpense />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/questionnaire" 
                element={
                  <ProtectedRoute skipOnboarding={true}>
                    <Questionnaire />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/showcase" 
                element={
                  <ProtectedRoute>
                    <ButtonShowcase />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/style-showcase" 
                element={
                  <ProtectedRoute>
                    <StyleShowcase />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;