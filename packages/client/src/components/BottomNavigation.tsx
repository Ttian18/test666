import { BarChart3, Home, Utensils, Camera } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/home" && (location.pathname === "/" || location.pathname === "/home")) {
      return true;
    }
    return location.pathname === path;
  };

  const tabs = [
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      path: "/reports",
    },
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/home",
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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-strong z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all duration-200",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;