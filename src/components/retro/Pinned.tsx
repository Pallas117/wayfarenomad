import { cn } from "@/lib/utils";

export function Pinned({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-4 rounded-full shadow-stamp-sm ink-border-thin",
        className,
      )}
      style={{
        background:
          "radial-gradient(circle at 30% 30%, hsl(var(--terracotta)) 0%, hsl(357 75% 35%) 70%, hsl(357 75% 25%) 100%)",
      }}
      aria-hidden
    />
  );
}