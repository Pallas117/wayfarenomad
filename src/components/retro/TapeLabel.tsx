import * as React from "react";
import { cn } from "@/lib/utils";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tilt?: number;
}

export function TapeLabel({ active, tilt = -2, className, children, style, ...props }: Props) {
  return (
    <button
      {...props}
      style={{ transform: `rotate(${tilt}deg)`, ...style }}
      className={cn(
        "px-3 py-1 text-[11px] tape-label-yellow press select-none",
        active && "ring-2 ring-[hsl(var(--terracotta))] ring-offset-2 ring-offset-[hsl(var(--background))]",
        className,
      )}
    >
      {children}
    </button>
  );
}