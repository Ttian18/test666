import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, Sparkles, Zap, Brain, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const aiButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        // AI-themed primary button with gradient and sparkle effects
        ai_primary: [
          "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-medium",
          "hover:from-purple-700 hover:to-blue-700 hover:shadow-strong",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:-skew-x-12 before:-translate-x-full",
          "hover:before:translate-x-full before:transition-transform before:duration-1000",
          "after:absolute after:inset-0 after:bg-gradient-to-r after:from-purple-400/20 after:to-blue-400/20 after:animate-pulse"
        ],
        // Neural network inspired button
        neural: [
          "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-medium",
          "hover:shadow-strong hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700",
          "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_1px,transparent_1px)] before:bg-[length:20px_20px] before:animate-pulse before:opacity-20"
        ],
        // Quantum-inspired glowing effect
        quantum: [
          "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-medium border border-cyan-400/30",
          "hover:from-cyan-700 hover:to-teal-700 hover:shadow-strong hover:border-cyan-300/50",
          "before:absolute before:inset-0 before:bg-gradient-conic before:from-cyan-400/20 before:via-transparent before:to-cyan-400/20 before:animate-spin-slow before:blur-sm"
        ],
        // Smart secondary button
        ai_secondary: [
          "bg-white/90 border-2 border-purple-300/50 text-purple-700 backdrop-blur-sm shadow-soft",
          "hover:bg-white hover:border-purple-400/60 hover:shadow-medium hover:text-purple-800",
          "dark:bg-gray-800/90 dark:border-purple-600/30 dark:text-purple-300 dark:hover:bg-gray-800 dark:hover:border-purple-500/50"
        ],
        // Minimal AI button
        ai_ghost: [
          "text-purple-600 hover:bg-purple-100/80 hover:text-purple-700 backdrop-blur-sm",
          "dark:text-purple-400 dark:hover:bg-purple-900/20 dark:hover:text-purple-300",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-purple-200/20 before:to-transparent before:translate-x-[-100%]",
          "hover:before:translate-x-[100%] before:transition-transform before:duration-700"
        ],
        // Success with sparkle animation
        success: [
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-medium",
          "hover:from-green-700 hover:to-emerald-700 hover:shadow-strong",
          "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_2px,transparent_2px)] after:bg-[length:30px_30px] after:animate-pulse after:opacity-0 hover:after:opacity-100"
        ],
        // Warning with pulse effect
        warning: [
          "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-medium",
          "hover:from-amber-700 hover:to-orange-700 hover:shadow-strong",
          "animate-pulse hover:animate-none"
        ],
        // Destructive with subtle shake
        destructive: [
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-medium",
          "hover:from-red-700 hover:to-rose-700 hover:shadow-strong hover:animate-pulse"
        ]
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12"
      },
      glow: {
        none: "",
        subtle: "drop-shadow-[0_0_6px_rgba(147,51,234,0.3)]",
        medium: "drop-shadow-[0_0_12px_rgba(147,51,234,0.4)]",
        strong: "drop-shadow-[0_0_20px_rgba(147,51,234,0.6)]"
      }
    },
    defaultVariants: {
      variant: "ai_primary",
      size: "default",
      glow: "none"
    }
  }
);

interface AIButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof aiButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: "sparkles" | "zap" | "brain" | "star" | "none";
  pulseOnHover?: boolean;
  glowOnHover?: boolean;
}

const iconMap = {
  sparkles: Sparkles,
  zap: Zap,
  brain: Brain,
  star: Star,
  none: null
};

const AIButton = React.forwardRef<HTMLButtonElement, AIButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    glow,
    asChild = false, 
    loading = false,
    loadingText = "Processing...",
    icon = "none",
    pulseOnHover = false,
    glowOnHover = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const IconComponent = iconMap[icon];
    
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(
          aiButtonVariants({ variant, size, glow, className }),
          pulseOnHover && "hover:animate-pulse",
          glowOnHover && "hover:drop-shadow-[0_0_20px_rgba(147,51,234,0.5)]",
          loading && "cursor-not-allowed",
          "focus:ring-purple-500 focus:ring-offset-2"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {!loading && IconComponent && (
          <IconComponent className="h-4 w-4 drop-shadow-sm" />
        )}
        {loading ? loadingText : children}
        
        {/* Floating particles effect for AI buttons */}
        {(variant === "ai_primary" || variant === "neural") && !loading && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white/40 rounded-full animate-ping animation-delay-0" />
            <div className="absolute -top-1 -right-1 w-1 h-1 bg-white/40 rounded-full animate-ping animation-delay-300" />
            <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white/40 rounded-full animate-ping animation-delay-600" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white/40 rounded-full animate-ping animation-delay-900" />
          </div>
        )}
      </Comp>
    );
  }
);

AIButton.displayName = "AIButton";

export { AIButton, aiButtonVariants };
export type { AIButtonProps };
