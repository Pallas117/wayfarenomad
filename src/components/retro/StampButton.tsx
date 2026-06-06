import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "amber" | "olive" | "terracotta" | "cream";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variantClass: Record<Variant, string> = {
  amber: "bg-[hsl(var(--amber))] text-[hsl(var(--foreground))]",
  olive: "bg-[hsl(var(--olive))] text-[hsl(var(--background))]",
  terracotta: "bg-[hsl(var(--terracotta))] text-[hsl(var(--background))]",
  cream: "bg-[hsl(var(--card))] text-[hsl(var(--foreground))]",
};

export const StampButton = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "amber", size = "md", children, ...props }, ref) => {
    const sz =
      size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm";
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 ink-border shadow-stamp press font-mono-retro font-bold uppercase tracking-wider rounded-[2px] no-text-shadow disabled:opacity-50 disabled:cursor-not-allowed",
          variantClass[variant],
          sz,
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
StampButton.displayName = "StampButton";