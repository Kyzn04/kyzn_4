import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost";
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CyberButton({
  children,
  className,
  variant = "primary",
  isLoading = false,
  size = "md",
  disabled,
  ...props
}: CyberButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-display font-bold tracking-wider uppercase transition-all duration-300 clip-path-slant disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden";
  
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]",
    secondary: "bg-secondary/10 text-secondary border border-secondary hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_20px_rgba(255,0,85,0.4)]",
    accent: "bg-accent/10 text-accent border border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_20px_rgba(255,255,0,0.4)]",
    ghost: "bg-transparent text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20",
  };

  const sizes = {
    sm: "h-8 px-4 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Glitch effect overlay on hover could go here */}
      <span className="relative z-10 flex items-center gap-2">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />
    </button>
  );
}
