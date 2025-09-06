import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import TopNavigation from "./TopNavigation";
import BottomNavigation from "./BottomNavigation";
import ContextualFAB from "./ContextualFAB";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
  showTopNav?: boolean;
  showBottomNav?: boolean;
  showFAB?: boolean;
}

const AppLayout = ({
  children,
  showTopNav = true,
  showBottomNav = true,
  showFAB = true,
}: AppLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Don't show navigation on certain pages
  const hideNavigation = [
    "/login",
    "/signup",
    "/intro",
    "/questionnaire",
    "/",
    "/blogs",
    "/pricing",
    "/about",
  ].includes(location.pathname);

  const shouldShowTopNav = showTopNav && !hideNavigation;
  const shouldShowBottomNav = showBottomNav && !hideNavigation && isMobile;
  const shouldShowFAB = showFAB && !hideNavigation;

  // Debug logging (temporary)
  if (process.env.NODE_ENV === "development") {
    console.log("AppLayout Debug:", {
      pathname: location.pathname,
      isMobile,
      hideNavigation,
      shouldShowTopNav,
      shouldShowBottomNav,
      shouldShowFAB,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - shown on desktop and larger screens */}
      {shouldShowTopNav && !isMobile && <TopNavigation />}

      {/* Main Content */}
      <main className={shouldShowBottomNav ? "pb-20" : ""}>{children}</main>

      {/* Bottom Navigation - shown on mobile only */}
      {shouldShowBottomNav && <BottomNavigation />}

      {/* Contextual FAB - shown on all protected routes */}
      {shouldShowFAB && <ContextualFAB />}
    </div>
  );
};

export default AppLayout;
