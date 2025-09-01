import { BarChart3, Home, Utensils, Plus, User, Sparkles, Camera } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TopNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/home" && (location.pathname === "/" || location.pathname === "/home")) {
      return true;
    }
    return location.pathname === path;
  };

  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/home",
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      path: "/reports",
    },
    {
      id: "recommendations",
      label: "Recommendation",
      icon: Utensils,
      path: "/recommendations",
    },
    {
      id: "zhongcao",
      label: "Discovery",
      icon: Camera,
      path: "/zhongcao",
    },
  ];

  return (
    <div className={cn(
      "sticky top-0 z-50 transition-all duration-500 ease-in-out",
      isScrolled ? "px-[10%] py-2" : "px-0 py-0"
    )}>
      <div className={cn(
        "transition-all duration-500 ease-in-out",
        isScrolled 
          ? "bg-white/70 backdrop-blur-xl border border-border/30 shadow-soft rounded-2xl mx-auto" 
          : "bg-white border-b border-border"
      )}>
        <div className={cn(
          "flex items-center justify-between px-6 transition-all duration-500 ease-in-out",
          isScrolled ? "py-2" : "py-4"
        )}>
        {/* Logo with AI branding */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "bg-gradient-primary rounded-xl flex items-center justify-center transition-all duration-500 ease-in-out relative overflow-hidden",
            isScrolled ? "w-8 h-8" : "w-10 h-10"
          )}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse" />
            <Sparkles className={cn(
              "text-white transition-all duration-500 ease-in-out",
              isScrolled ? "w-4 h-4" : "w-5 h-5"
            )} />
          </div>
          <span className={cn(
            "font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-500 ease-in-out",
            isScrolled ? "text-lg" : "text-xl"
          )}>
            MealMint AI
          </span>
        </div>

        {/* Navigation with enhanced animations */}
        <div className="flex items-center gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "group relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105",
                  isScrolled ? "px-3 py-1.5" : "px-4 py-2",
                  active 
                    ? "text-white bg-gradient-primary shadow-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80 backdrop-blur-sm"
                )}
              >
                <Icon className={cn(
                  "transition-all duration-300",
                  isScrolled ? "w-4 h-4" : "w-5 h-5",
                  active && "drop-shadow-sm"
                )} />
                <span className={cn(
                  "font-medium transition-all duration-300",
                  isScrolled ? "text-xs" : "text-sm"
                )}>{tab.label}</span>
                {active && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
                )}
              </button>
            );
          })}
          
          {/* Enhanced Add Expense Button */}
          <Button
            onClick={() => navigate('/add-expense')}
            className={cn(
              "bg-gradient-primary hover:bg-gradient-primary/90 text-white flex items-center gap-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-medium relative overflow-hidden",
              isScrolled ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus className={cn(
              "transition-all duration-300",
              isScrolled ? "w-4 h-4" : "w-5 h-5"
            )} />
            {!isScrolled && <span className="font-medium">Add Expense</span>}
          </Button>
          
          {/* Enhanced Profile Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm",
              isScrolled ? "w-8 h-8" : "w-10 h-10"
            )}
          >
            <User className={cn(
              "transition-all duration-300",
              isScrolled ? "w-4 h-4" : "w-5 h-5"
            )} />
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;