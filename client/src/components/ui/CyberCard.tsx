import React from "react";
import { cn } from "@/lib/utils";

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "neon";
  title?: string;
  action?: React.ReactNode;
}

export function CyberCard({ 
  children, 
  className, 
  variant = "default",
  title,
  action,
  ...props 
}: CyberCardProps) {
  return (
    <div 
      className={cn(
        "relative bg-card border border-border/50 overflow-hidden group transition-all duration-300",
        // Clip corners
        "before:absolute before:top-0 before:right-0 before:w-6 before:h-6 before:bg-background before:border-b before:border-l before:border-border/50 before:z-10",
        variant === "neon" && "hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.1)]",
        className
      )} 
      {...props}
    >
      {/* Decorative scanline */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[1px] w-full animate-scan opacity-0 group-hover:opacity-100 pointer-events-none" />
      
      {/* Header */}
      {(title || action) && (
        <div className="flex items-center justify-between p-6 pb-2 border-b border-border/30 mb-4 bg-muted/20">
          {title && (
            <h3 className="text-xl font-display font-bold tracking-widest text-primary flex items-center gap-2">
              <span className="w-2 h-2 bg-primary inline-block rotate-45" />
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      
      <div className={cn("p-6 pt-2", (title || action) ? "pt-2" : "pt-6")}>
        {children}
      </div>

      {/* Tech decorations */}
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-primary/30" />
    </div>
  );
}
