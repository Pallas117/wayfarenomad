import { NavLink } from "react-router-dom";
import { Store, Users, Radio, Trophy, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/marketplace", icon: Store, label: "Market" },
  { to: "/social", icon: Users, label: "Social" },
  { to: "/pulse", icon: Radio, label: "Pulse" },
  { to: "/safety", icon: Shield, label: "Safety" },
  { to: "/leaderboard", icon: Trophy, label: "Board" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] justify-center",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn("relative", isActive && "glow-gold rounded-full")}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
