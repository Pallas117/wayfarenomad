import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Pin, Radio, Ticket, MapPin, MessageSquare, Shield, Trophy, Settings } from "lucide-react";

const primary = [
  { to: "/board", label: "Board", icon: Pin },
  { to: "/logbook", label: "Logbook", icon: Radio },
  { to: "/tickets", label: "Tickets", icon: Ticket },
];

const secondary = [
  { to: "/pulse", label: "Pulse", icon: MapPin },
  { to: "/messages", label: "Chat", icon: MessageSquare },
  { to: "/safety", label: "Safety", icon: Shield },
  { to: "/leaderboard", label: "Rank", icon: Trophy },
  { to: "/settings", label: "Set", icon: Settings },
];

export function RadioDialSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 w-[88px] flex-col items-center gap-4 py-6 bg-[hsl(var(--sidebar-background))] border-r-2 border-[hsl(var(--foreground))]">
      <div className="relative">
        <div className="h-14 w-14 rounded-full ink-border shadow-stamp bg-gradient-to-br from-[hsl(var(--amber))] to-[hsl(33_100%_42%)] flex items-center justify-center">
          <span className="font-mono-retro font-bold text-xs tracking-widest">WF</span>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[hsl(var(--foreground))]" />
      </div>

      <div className="h-px w-10 bg-[hsl(var(--foreground))]" />

      <nav className="flex flex-col gap-2">
        {primary.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 w-[64px] py-2 ink-border-thin rounded-[2px] press",
                active ? "bg-[hsl(var(--amber))] shadow-stamp-sm" : "bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.25} />
              <span className="font-mono-retro text-[9px] uppercase tracking-wider">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-2 font-mono-retro text-[8px] tracking-[0.25em] text-[hsl(var(--foreground))]/50">— MORE —</div>

      <nav className="flex flex-col gap-1.5">
        {secondary.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={cn(
                "flex items-center justify-center h-9 w-9 ink-border-thin rounded-[2px] press",
                active ? "bg-[hsl(var(--olive))] text-[hsl(var(--background))]" : "bg-transparent hover:bg-[hsl(var(--muted))]",
              )}
            >
              <Icon className="h-4 w-4" />
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-1">
        <span className="led-dot" />
        <span className="font-mono-retro text-[8px] tracking-widest text-[hsl(var(--foreground))]/60">ON AIR</span>
      </div>
    </aside>
  );
}