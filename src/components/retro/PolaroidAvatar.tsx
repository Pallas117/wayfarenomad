import { cn } from "@/lib/utils";

interface Props {
  src?: string;
  alt?: string;
  initials?: string;
  caption?: string;
  className?: string;
}

export function PolaroidAvatar({ src, alt = "", initials, caption, className }: Props) {
  return (
    <div className={cn("bg-[hsl(var(--card))] ink-border p-2 pb-3 shadow-stamp-sm", className)}>
      <div className="aspect-square w-full bg-[hsl(var(--muted))] ink-border-thin flex items-center justify-center overflow-hidden">
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="font-mono-retro text-2xl font-bold text-[hsl(var(--foreground))]">
            {initials || "??"}
          </span>
        )}
      </div>
      {caption && (
        <p className="font-typewriter mt-2 text-center text-[10px] tracking-wider text-[hsl(var(--foreground))]/70">
          {caption}
        </p>
      )}
    </div>
  );
}