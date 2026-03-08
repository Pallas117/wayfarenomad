import { cn } from "@/lib/utils";

interface GoldSkeletonProps {
  className?: string;
  variant?: "card" | "avatar" | "line" | "badge";
}

export function GoldSkeleton({ className, variant = "line" }: GoldSkeletonProps) {
  const base = "relative overflow-hidden rounded-md";

  const variantClasses = {
    card: "h-32 w-full rounded-xl",
    avatar: "h-12 w-12 rounded-full",
    line: "h-4 w-full",
    badge: "h-6 w-20 rounded-full",
  };

  return (
    <div
      className={cn(
        base,
        variantClasses[variant],
        "bg-secondary/50",
        className
      )}
    >
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, hsla(43, 72%, 52%, 0.08), hsla(43, 80%, 60%, 0.15), hsla(43, 72%, 52%, 0.08), transparent)",
          backgroundSize: "200% 100%",
        }}
      />
      {/* Twinkle dots */}
      <div
        className="absolute top-1/3 left-1/4 h-1 w-1 rounded-full bg-primary/30 animate-twinkle"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="absolute top-2/3 right-1/3 h-1 w-1 rounded-full bg-primary/30 animate-twinkle"
        style={{ animationDelay: "0.8s" }}
      />
    </div>
  );
}

/** A full card skeleton matching the glass-card style */
export function GoldCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <GoldSkeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <GoldSkeleton variant="line" className="w-2/3" />
          <GoldSkeleton variant="line" className="w-1/3 h-3" />
        </div>
      </div>
      <GoldSkeleton variant="line" className="w-full" />
      <GoldSkeleton variant="line" className="w-4/5 h-3" />
      <div className="flex gap-2">
        <GoldSkeleton variant="badge" />
        <GoldSkeleton variant="badge" />
      </div>
    </div>
  );
}

/** Event card skeleton */
export function GoldEventSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <GoldSkeleton variant="badge" />
          <GoldSkeleton variant="badge" className="w-14" />
        </div>
        <GoldSkeleton variant="line" className="h-4 w-4" />
      </div>
      <GoldSkeleton variant="line" className="w-3/4 h-5" />
      <GoldSkeleton variant="line" className="w-full" />
      <div className="flex gap-4">
        <GoldSkeleton variant="line" className="w-24 h-3" />
        <GoldSkeleton variant="line" className="w-20 h-3" />
      </div>
    </div>
  );
}
