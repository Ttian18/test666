import { Sparkles, BookOpen, DollarSign, Info, LogIn, UserPlus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LandingNavigation = () => {
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
    return location.pathname === path;
  };

  const tabs = [
    // {
    //   id: "blogs",
    //   label: "Blogs",
    //   icon: BookOpen,
    //   path: "/blogs",
    // },
    // {
    //   id: "pricing",
    //   label: "Pricing",
    //   icon: DollarSign,
    //   path: "/pricing",
    // },
    {
      id: "about",
      label: "About",
      icon: Info,
      path: "/about",
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
          ? "bg-white/70 backdrop-blur-xl border border-blue-200/30 shadow-lg rounded-2xl mx-auto" 
          : "bg-white/80 backdrop-blur-sm border-b border-blue-100/50"
      )}>
        <div className={cn(
          "flex items-center justify-between px-6 transition-all duration-500 ease-in-out",
          isScrolled ? "py-3" : "py-4"
        )}>
          {/* Logo with AI branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className={cn(
              "bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center transition-all duration-500 ease-in-out relative overflow-hidden",
              isScrolled ? "w-10 h-10" : "w-12 h-12"
            )}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 animate-pulse" />
              <Sparkles className={cn(
                "text-white transition-all duration-500 ease-in-out",
                isScrolled ? "w-5 h-5" : "w-6 h-6"
              )} />
            </div>
            <span className={cn(
              "font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent transition-all duration-500 ease-in-out",
              isScrolled ? "text-xl" : "text-2xl"
            )}>
              LaiSpend
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    "group relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105",
                    isScrolled ? "px-3 py-2" : "px-4 py-2",
                    active 
                      ? "text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg" 
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 backdrop-blur-sm"
                  )}
                >
                  <Icon className={cn(
                    "transition-all duration-300",
                    isScrolled ? "w-4 h-4" : "w-4 h-4",
                    active && "drop-shadow-sm"
                  )} />
                  <span className={cn(
                    "font-medium transition-all duration-300",
                    isScrolled ? "text-sm" : "text-sm"
                  )}>{tab.label}</span>
                  {active && (
                    <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className={cn(
                "text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center gap-2",
                isScrolled ? "px-3 py-2 text-sm" : "px-4 py-2 text-sm"
              )}
            >
              <LogIn className="w-4 h-4" />
              {!isScrolled && <span>Login</span>}
            </Button>
            
            <Button
              onClick={() => navigate('/signup')}
              className={cn(
                "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden",
                isScrolled ? "px-3 py-2 text-sm" : "px-4 py-2 text-sm"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <UserPlus className="w-4 h-4" />
              {!isScrolled && <span>Sign Up</span>}
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-blue-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingNavigation;
