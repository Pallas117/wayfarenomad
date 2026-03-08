import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { ShieldCheck, MessageSquare, Settings } from "lucide-react";
import { SailboatIcon, PlaneIcon, CompassRose, WeatherSunIcon } from "@/components/animations/TravelIcons";
import { useUnreadCount } from "@/hooks/useUnreadCount";

interface NavTab {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }> | null;
  travelIcon?: React.ComponentType<{ className?: string; color?: string }>;
}

const tabs: NavTab[] = [
  { to: "/marketplace", icon: null, travelIcon: SailboatIcon, label: "Market" },
  { to: "/social", icon: null, travelIcon: CompassRose, label: "Social" },
  { to: "/messages", icon: MessageSquare, label: "Chat" },
  { to: "/pulse", icon: null, travelIcon: WeatherSunIcon, label: "Pulse" },
  { to: "/safety", icon: ShieldCheck, label: "Safety" },
];

export function BottomNav() {
  const unreadCount = useUnreadCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, travelIcon: TravelIcon, label }) => (
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
                <motion.div
                  className={cn("relative", isActive && "glow-gold rounded-full")}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {TravelIcon ? (
                    <TravelIcon
                      className="h-5 w-5"
                      color="currentColor"
                    />
                  ) : Icon ? (
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
                  ) : null}
                  {to === "/messages" && unreadCount > 0 && (
                    <motion.span
                      className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-destructive flex items-center justify-center text-[9px] font-bold text-destructive-foreground"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </motion.div>
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
              <motion.div
                className={cn("relative", isActive && "glow-gold rounded-full")}
                whileTap={{ scale: 0.85 }}
              >
                <Settings className="h-4 w-4" strokeWidth={isActive ? 2.5 : 1.8} />
              </motion.div>
              <span className="text-[9px] font-medium">Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
