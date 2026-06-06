import { cn } from "@/lib/utils";

interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  id?: string;
}

export function FlipToggle({ checked, onChange, label, id }: Props) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-3 cursor-pointer select-none">
      <span className={cn("relative inline-block h-7 w-14 ink-border bg-[hsl(var(--muted))] shadow-stamp-sm")}>
        <input
          id={id}
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={cn(
            "absolute top-[2px] h-5 w-6 ink-border-thin transition-all duration-150",
            checked ? "left-[28px] bg-[hsl(var(--amber))]" : "left-[2px] bg-[hsl(var(--card))]",
          )}
          style={{
            boxShadow: "inset 0 -2px 0 hsl(var(--foreground) / 0.3), inset 0 1px 0 hsl(var(--background))",
          }}
        />
      </span>
      {label && <span className="font-mono-retro text-xs uppercase tracking-wider">{label}</span>}
    </label>
  );
}