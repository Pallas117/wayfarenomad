import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { Flame, Compass, Radio, ShieldCheck, MessageSquare, Settings } from "lucide-react";
import { useUnreadCount } from "@/hooks/useUnreadCount";

const tabs = [
  { to: "/marketplace", icon: Flame, label: "Market" },
  { to: "/social", icon: Compass, label: "Social" },
  { to: "/messages", icon: MessageSquare, label: "Chat" },
  { to: "/pulse", icon: Radio, label: "Pulse" },
  { to: "/safety", icon: ShieldCheck, label: "Safety" },
];

export function BottomNav() {
  const unreadCount = useUnreadCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => haptic("tap")}
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
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
                  {to === "/messages" && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-destructive flex items-center justify-center text-[9px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        {/* Settings icon */}
        <NavLink
          to="/settings"
          onClick={() => haptic("tap")}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-[36px] min-h-[44px] justify-center",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn("relative", isActive && "glow-gold rounded-full")}>
                <Settings className="h-4 w-4" strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className="text-[9px] font-medium">Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
