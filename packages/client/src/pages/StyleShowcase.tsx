import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Palette, Eye, Navigation, Sparkles } from "lucide-react";
import TopNavigation from "@/components/TopNavigation";

const StyleShowcase: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-background">
      <TopNavigation />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Palette className="w-8 h-8 text-primary" />
            Style Showcase
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the enhanced design system with paper textures, improved
            animations, and responsive navigation
          </p>
        </div>

        {/* Navigation Demo */}
        <div className="themed-card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Navigation className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Smart Navigation</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Scroll down this page to see the navigation bar shrink to 80% width
            with transparent background and rounded borders.
          </p>
          <div className="bg-secondary/30 p-4 rounded-lg border-l-4 border-primary">
            <p className="text-sm">
              <strong>Try it:</strong> Scroll down and watch the navigation
              transform smoothly with blur effects and elegant animations.
            </p>
          </div>
        </div>

        {/* Background Patterns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="themed-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              Reports Background
            </h3>
            <div className="h-24 rounded-lg bg-gradient-to-r from-purple-100 to-green-100 page-background-reports bg-blend-overlay mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Data visualization inspired patterns with subtle grid lines and
              colored dots
            </p>
            <Button
              size="sm"
              className="mt-3 enhanced-button"
              onClick={() => navigate("/reports")}
            >
              View Reports
            </Button>
          </div>

          <div className="themed-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-600" />
              Recommendations Background
            </h3>
            <div className="h-24 rounded-lg bg-gradient-to-r from-orange-100 to-red-100 page-background-recommendations bg-blend-overlay mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Food and restaurant inspired organic patterns with warm color
              accents
            </p>
            <Button
              size="sm"
              className="mt-3 enhanced-button"
              onClick={() => navigate("/menu-analysis")}
            >
              View Recommendations
            </Button>
          </div>

          <div className="themed-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-pink-600" />
              Add Expense Background
            </h3>
            <div className="h-24 rounded-lg bg-gradient-to-r from-pink-100 to-purple-100 page-background-add-expense bg-blend-overlay mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Document and receipt inspired with notebook lines and margin
              guides
            </p>
            <Button
              size="sm"
              className="mt-3 enhanced-button"
              onClick={() => navigate("/add-expense")}
            >
              Add Expense
            </Button>
          </div>
        </div>

        {/* Features List */}
        <div className="themed-card p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            What's New
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg text-primary">
                ✨ UI Improvements
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Removed jarring dropdown slide-in animations</li>
                <li>• Added subtle paper texture throughout the app</li>
                <li>• Enhanced background patterns for each page</li>
                <li>• Improved ivory/grey color scheme (no pure white)</li>
                <li>• Added decorative dots, lines, and circles</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lg text-primary">
                🎯 Navigation
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Smart shrinking navigation on scroll</li>
                <li>• Reduces to 80% width with rounded borders</li>
                <li>• Transparent background with blur effects</li>
                <li>• Smooth transitions and animations</li>
                <li>• Enhanced visual hierarchy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Long content to demonstrate scroll behavior */}
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="themed-card p-6">
              <h3 className="font-semibold mb-3">Scroll Demo Section {i}</h3>
              <p className="text-muted-foreground">
                This content is here to demonstrate the scroll behavior. As you
                scroll down, notice how the navigation bar smoothly transitions
                to a more compact, rounded design with a transparent background.
                The animation uses smooth cubic-bezier curves for a natural
                feel.
              </p>
              <div className="mt-4 h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">
                  Demo Content Block {i}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12 pb-20">
          <Button
            onClick={() => navigate("/home")}
            className="enhanced-button px-8 py-3"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StyleShowcase;
