import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AIButton } from "@/components/ui/ai-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [monthlySpent] = useState(1240);
  const [monthlyBudget] = useState(2000);

  const spentPercentage = (monthlySpent / monthlyBudget) * 100;
  const remaining = monthlyBudget - monthlySpent;

  const todayRecommendation = {
    restaurant: "Healthy Bowl Co.",
    dish: "Mediterranean Bowl + Green Smoothie",
    price: "$18.5",
    calories: "520 cal",
  };

  return (
    <AppLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* AI-powered animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000" />
          <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full filter blur-3xl animate-spin-slow" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Enhanced Welcome Section */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-fade-in">
                Welcome back, {user?.name || "User"}! ✨
              </h1>
              <p className="text-lg text-muted-foreground mb-6 animate-fade-in">
                Your AI-powered financial companion is ready to help you manage
                your budget smartly
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-purple-600 font-medium animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                  <span>AI Analytics Running</span>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse animation-delay-1000" />
                </div>
                <div className="flex gap-2">
                  <AIButton
                    variant="ai_ghost"
                    size="sm"
                    onClick={() => navigate("/showcase")}
                    className="text-xs"
                  >
                    🎨 UI Showcase
                  </AIButton>
                  <AIButton
                    // variant="ai_glow"
                    size="sm"
                    onClick={() => navigate("/style-showcase")}
                    className="text-xs"
                  >
                    ✨ Style Demo
                  </AIButton>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Monthly Budget Card */}
              <Card className="bg-gradient-primary text-white shadow-strong backdrop-blur-sm border-0 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-2 -right-2 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
                  <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse animation-delay-3000" />
                </div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    Monthly Budget
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <p className="text-3xl font-bold">${monthlySpent}</p>
                      <p className="text-white/80">of ${monthlyBudget}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Remaining</p>
                      <p className="text-2xl font-bold">${remaining}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress
                      value={spentPercentage}
                      className="h-3 bg-white/20"
                    />
                    <p className="text-white/90 text-sm">
                      {spentPercentage.toFixed(0)}% of budget used
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Today's Recommendation Card */}
              <Card className="themed-card relative overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                {/* AI recommendation shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    AI Recommendation
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse animation-delay-500" />
                      <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse animation-delay-1000" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-foreground">
                          {todayRecommendation.restaurant}
                        </h4>
                        <p className="text-muted-foreground">
                          {todayRecommendation.dish}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-primary">
                          {todayRecommendation.price}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {todayRecommendation.calories}
                        </p>
                      </div>
                    </div>

                    <AIButton
                      variant="ai_primary"
                      icon="brain"
                      className="w-full"
                      onClick={() => navigate("/menu-analysis")}
                      glow="medium"
                      glowOnHover={true}
                    >
                      🚀 Explore AI Recommendations
                    </AIButton>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Quick Access
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2 hover:bg-primary/5"
                  onClick={() => navigate("/zhongcao")}
                >
                  <div className="text-2xl">📋</div>
                  <span className="text-sm font-medium">Wishlists</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2 hover:bg-primary/5"
                  onClick={() => navigate("/menu-analysis")}
                >
                  <div className="text-2xl">🤖</div>
                  <span className="text-sm font-medium">AI Menu</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2 hover:bg-primary/5"
                  onClick={() => navigate("/add-expense")}
                >
                  <div className="text-2xl">💰</div>
                  <span className="text-sm font-medium">Add Expense</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center gap-2 hover:bg-primary/5"
                  onClick={() => navigate("/restaurant-recommendations")}
                >
                  <div className="text-2xl">🍽️</div>
                  <span className="text-sm font-medium">Restaurants</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
