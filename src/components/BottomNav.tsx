import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { Pin, Radio, Ticket, MessageSquare, Settings } from "lucide-react";
import { useUnreadCount } from "@/hooks/useUnreadCount";

interface NavTab {
  to: string;
  label: string;
  icon: React.ComponentType<any>;
}

const tabs: NavTab[] = [
  { to: "/board", icon: Pin, label: "Board" },
  { to: "/logbook", icon: Radio, label: "Logbook" },
  { to: "/tickets", icon: Ticket, label: "Tickets" },
  { to: "/messages", icon: MessageSquare, label: "Chat" },
];

export function BottomNav() {
  const unreadCount = useUnreadCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--card))] border-t-2 border-[hsl(var(--foreground))]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => haptic("tap")}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 min-w-[44px] min-h-[44px] justify-center ink-border-thin rounded-[2px] press font-mono-retro",
                isActive
                  ? "bg-[hsl(var(--amber))] text-[hsl(var(--foreground))] shadow-stamp-sm"
                  : "bg-transparent text-[hsl(var(--foreground))]/70 hover:bg-[hsl(var(--muted))]",
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.div className="relative" whileTap={{ scale: 0.85 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {to === "/messages" && unreadCount > 0 && (
                    <motion.span
                      className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 bg-[hsl(var(--terracotta))] ink-border-thin flex items-center justify-center text-[9px] font-bold text-[hsl(var(--background))]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </motion.div>
                <span className="text-[9px] uppercase tracking-wider font-bold">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <NavLink to="/settings" onClick={() => haptic("tap")} className="flex items-center justify-center h-10 w-10 ink-border-thin rounded-[2px] press">
          <Settings className="h-4 w-4" />
        </NavLink>
      </div>
    </nav>
  );
}
