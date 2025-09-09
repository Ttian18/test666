import {
  BarChart3,
  Home,
  Utensils,
  Plus,
  User,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TopNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest("nav")) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    if (
      path === "/home" &&
      (location.pathname === "/" || location.pathname === "/home")
    ) {
      return true;
    }
    return location.pathname === path;
  };

  const tabs = [
    {
      id: "home",
      label: "Home",
      path: "/home",
    },
    {
      id: "reports",
      label: "Analytics",
      path: "/reports",
    },
    {
      id: "menu-analysis",
      label: "AI Menu",
      path: "/menu-analysis",
    },
    {
      id: "restaurant-recommendations",
      label: "Restaurants",
      path: "/restaurant-recommendations",
    },
    {
      id: "zhongcao",
      label: "Wishlists",
      path: "/zhongcao",
    },
  ];

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/50"
          : "bg-white/95 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Apple-inspired clean branding */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/home")}
          >
            <div className="text-2xl font-semibold text-gray-900 tracking-tight">
              LaiSpend
            </div>
          </div>

          {/* Main Navigation - Apple-style clean tabs */}
          <div className="hidden md:flex items-center space-x-8">
            {tabs.map((tab) => {
              const active = isActive(tab.path);

              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    "relative text-sm font-medium transition-all duration-200 ease-in-out",
                    "hover:text-gray-900 focus:outline-none focus:text-gray-900",
                    active ? "text-gray-900" : "text-gray-600"
                  )}
                >
                  {tab.label}
                  {active && (
                    <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side Actions - Apple-style minimal */}
          <div className="flex items-center space-x-4">
            {/* Shopping bag icon like Apple */}
            <Button
              onClick={() => navigate("/add-expense")}
              variant="ghost"
              size="sm"
              className={cn(
                "hidden md:flex items-center gap-2 px-4 py-2 rounded-full",
                "bg-blue-600 hover:bg-blue-700 text-white",
                "transition-all duration-200 ease-in-out",
                "text-sm font-medium"
              )}
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>

            {/* Profile - Apple-style clean */}
            <Button
              onClick={() => navigate("/profile")}
              variant="ghost"
              size="icon"
              className={cn(
                "w-10 h-10 rounded-full",
                "hover:bg-gray-100 transition-colors duration-200",
                "text-gray-600 hover:text-gray-900"
              )}
            >
              <User className="w-5 h-5" />
            </Button>

            {/* Mobile menu button - Apple-style hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-10 h-10 rounded-full hover:bg-gray-100 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="flex flex-col space-y-1">
                <div
                  className={cn(
                    "w-5 h-0.5 bg-current rounded-full transition-transform duration-200",
                    isMobileMenuOpen && "rotate-45 translate-y-1.5"
                  )}
                ></div>
                <div
                  className={cn(
                    "w-5 h-0.5 bg-current rounded-full transition-opacity duration-200",
                    isMobileMenuOpen && "opacity-0"
                  )}
                ></div>
                <div
                  className={cn(
                    "w-5 h-0.5 bg-current rounded-full transition-transform duration-200",
                    isMobileMenuOpen && "-rotate-45 -translate-y-1.5"
                  )}
                ></div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown - Apple-inspired */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
          <div className="px-6 py-4 space-y-3">
            {tabs.map((tab) => {
              const active = isActive(tab.path);

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    navigate(tab.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200",
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}

            {/* Mobile Add Expense Button */}
            <Button
              onClick={() => {
                navigate("/add-expense");
                setIsMobileMenuOpen(false);
              }}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavigation;
