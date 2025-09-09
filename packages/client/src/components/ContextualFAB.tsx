import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Camera,
  MapPin,
  Download,
  Utensils,
  BarChart3,
  Sparkles,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FABConfig {
  icon: React.ComponentType<any>;
  action: string;
  label: string;
  path: string;
  variant?: "default" | "primary" | "secondary";
}

const ContextualFAB = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // Force visibility for debugging
  const forceVisible = true;
  const [lastScrollY, setLastScrollY] = useState(0);

  // Define FAB configurations for different pages
  const fabConfigs: Record<string, FABConfig> = {
    "/home": {
      icon: Plus,
      action: "add-expense",
      label: "Add Expense",
      path: "/add-expense",
      variant: "primary",
    },
    "/": {
      icon: Plus,
      action: "add-expense",
      label: "Add Expense",
      path: "/add-expense",
      variant: "primary",
    },
    "/menu-analysis": {
      icon: Camera,
      action: "scan-menu",
      label: "Scan Menu",
      path: "/menu-analysis",
      variant: "primary",
    },
    "/restaurant-recommendations": {
      icon: MapPin,
      action: "find-nearby",
      label: "Find Nearby",
      path: "/restaurant-recommendations",
      variant: "secondary",
    },
    "/reports": {
      icon: BarChart3,
      action: "export",
      label: "View Insights",
      path: "/reports",
      variant: "secondary",
    },
    "/zhongcao": {
      icon: Camera,
      action: "scan-wishlist",
      label: "Scan Item",
      path: "/zhongcao",
      variant: "primary",
    },
    "/profile": {
      icon: FileText,
      action: "edit-profile",
      label: "Edit Profile",
      path: "/profile",
      variant: "default",
    },
  };

  // Get current FAB configuration
  const currentConfig = fabConfigs[location.pathname] || fabConfigs["/home"];

  // Debug logging (temporary)
  if (process.env.NODE_ENV === "development") {
    console.log("FAB Debug:", {
      pathname: location.pathname,
      currentConfig,
      isVisible,
      hasConfig: !!currentConfig,
      lastScrollY,
      windowScrollY: window.scrollY,
    });
  }

  // Handle scroll-based visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide FAB when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Handle FAB click based on current context
  const handleFABClick = () => {
    console.log("FAB clicked!", {
      action: currentConfig.action,
      path: currentConfig.path,
      pathname: location.pathname,
    });

    // For home page, always navigate to add-expense
    if (location.pathname === "/home" || location.pathname === "/") {
      console.log("Home page detected - navigating to add-expense...");
      navigate("/add-expense");
      return;
    }

    switch (currentConfig.action) {
      case "add-expense":
        console.log("Navigating to add-expense...");
        navigate("/add-expense");
        break;
      case "scan-menu":
        // Trigger camera or file upload for menu scanning
        const menuInput = document.createElement("input");
        menuInput.type = "file";
        menuInput.accept = "image/*";
        menuInput.capture = "environment";
        menuInput.onchange = (e) => {
          // Handle menu photo upload
          console.log("Menu photo selected:", e.target?.files?.[0]);
          // You can integrate with your existing menu analysis service here
        };
        menuInput.click();
        break;
      case "scan-wishlist":
        // Trigger camera for wishlist item scanning
        const wishlistInput = document.createElement("input");
        wishlistInput.type = "file";
        wishlistInput.accept = "image/*";
        wishlistInput.capture = "environment";
        wishlistInput.onchange = (e) => {
          // Handle wishlist photo upload
          console.log("Wishlist photo selected:", e.target?.files?.[0]);
          // You can integrate with your existing zhongcao service here
        };
        wishlistInput.click();
        break;
      case "find-nearby":
        // Trigger location-based restaurant search
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("Location found:", position.coords);
              // You can integrate with your restaurant recommendation service here
            },
            (error) => {
              console.error("Location access denied:", error);
              // Fallback to manual location input
            }
          );
        }
        break;
      case "export":
        // Trigger data export
        console.log("Exporting data...");
        // You can integrate with your reports export functionality here
        break;
      case "edit-profile":
        // Navigate to profile edit mode or open edit dialog
        console.log("Edit profile mode");
        break;
      default:
        navigate(currentConfig.path);
    }
  };

  const Icon = currentConfig.icon;

  return (
    <div
      className={cn(
        "fixed right-4 transition-all duration-300 ease-in-out transform",
        "bottom-24 md:bottom-6", // Higher on mobile to avoid bottom nav
        isVisible || forceVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-16 opacity-0 scale-75 pointer-events-none"
      )}
      style={{ zIndex: 9999 }}
    >
      {/* FAB Button - Test Version */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("🔥 NATIVE BUTTON CLICKED! Event:", e);
          console.log("🔥 Current pathname:", location.pathname);
          console.log("🔥 Attempting navigation to /add-expense...");
          try {
            navigate("/add-expense");
            console.log("🔥 Navigation call completed");
          } catch (error) {
            console.error("🔥 Navigation error:", error);
          }
        }}
        onMouseDown={() => console.log("🔥 Native Button Mouse Down")}
        onMouseUp={() => console.log("🔥 Native Button Mouse Up")}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95",
          "flex items-center justify-center relative overflow-hidden group cursor-pointer",
          currentConfig.variant === "primary" &&
            "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/25",
          currentConfig.variant === "secondary" &&
            "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white shadow-blue-500/25",
          currentConfig.variant === "default" &&
            "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-gray-500/25"
        )}
        style={{ zIndex: 9999 }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <Icon className="w-6 h-6 relative z-10" />
      </button>

      {/* Label tooltip */}
      <div className="absolute right-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
          {currentConfig.label}
          <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
        </div>
      </div>

      {/* Pulse animation for primary actions */}
      {currentConfig.variant === "primary" && (
        <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20" />
      )}
    </div>
  );
};

export default ContextualFAB;
