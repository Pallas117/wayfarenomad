import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Compass, MapPin, Plane, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

const STORAGE_KEY = "wayfare-onboarding-checklist-v1";
const DISMISS_KEY = "wayfare-onboarding-checklist-dismissed-v1";
const COMPLETE_KEY = "wayfare-onboarding-checklist-completed-v1";

type TaskId = "meet-sync" | "pulse-pin" | "trip-post";

type Task = {
  id: TaskId;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  cta: string;
};

const TASKS: Task[] = [
  {
    id: "meet-sync",
    icon: Compass,
    title: "Try Meet-Sync",
    description: "Find nomads sharing your city and dates.",
    href: "/social",
    cta: "Open Social",
  },
  {
    id: "pulse-pin",
    icon: MapPin,
    title: "Drop your first Pulse pin",
    description: "Share an event, hangout, or hidden gem on the map.",
    href: "/pulse",
    cta: "Open Pulse",
  },
  {
    id: "trip-post",
    icon: Plane,
    title: "Post your first trip",
    description: "Add an itinerary so the tribe can sync up with you.",
    href: "/profile/me",
    cta: "Add Trip",
  },
];

type State = Record<TaskId, boolean>;
const EMPTY: State = { "meet-sync": false, "pulse-pin": false, "trip-post": false };

function readState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

export function markOnboardingTask(id: TaskId) {
  try {
    const next = { ...readState(), [id]: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("wayfare-onboarding-update"));
  } catch {
    /* noop */
  }
}

export function OnboardingChecklist() {
  const [state, setState] = useState<State>(EMPTY);
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setState(readState());
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    const onUpdate = () => setState(readState());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(readState());
    };
    window.addEventListener("wayfare-onboarding-update", onUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("wayfare-onboarding-update", onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const completed = useMemo(() => TASKS.filter((t) => state[t.id]).length, [state]);
  const total = TASKS.length;
  const allDone = completed === total;

  // Fire celebration toast once when everything is checked.
  useEffect(() => {
    if (!allDone) return;
    if (localStorage.getItem(COMPLETE_KEY) === "true") return;
    localStorage.setItem(COMPLETE_KEY, "true");
    haptic("success");
    toast.success("Constellation complete!", {
      description: "You've finished the Wayfare onboarding. Safe travels, nomad.",
      icon: <Sparkles className="h-4 w-4" />,
      duration: 6000,
    });
  }, [allDone]);

  const toggle = (id: TaskId) => {
    haptic("tap");
    const next = { ...state, [id]: !state[id] };
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const dismiss = () => {
    haptic("tap");
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  if (dismissed) return null;
  if (allDone && localStorage.getItem(COMPLETE_KEY) === "true" && collapsed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 right-3 left-3 sm:left-auto sm:right-4 sm:bottom-24 z-40 sm:max-w-sm"
    >
      <div className="rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-2 flex-1 text-left"
            aria-label="Toggle onboarding checklist"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <div>
              <div className="text-xs font-semibold tracking-wide text-foreground">
                Get started
              </div>
              <div className="text-[10px] text-muted-foreground">
                {completed} of {total} complete
              </div>
            </div>
            <div className="ml-auto text-muted-foreground">
              {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
          <button
            onClick={dismiss}
            className="ml-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Dismiss onboarding checklist"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${(completed / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          />
        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="divide-y divide-border/40"
            >
              {TASKS.map((task) => {
                const done = state[task.id];
                const Icon = task.icon;
                return (
                  <li key={task.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => toggle(task.id)}
                      className={cn(
                        "flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                        done
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/40 hover:border-primary"
                      )}
                      aria-label={done ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                    >
                      {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-sm font-medium",
                          done ? "text-muted-foreground line-through" : "text-foreground"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 text-primary/70" />
                        {task.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {task.description}
                      </div>
                    </div>
                    {!done && (
                      <Link
                        to={task.href}
                        onClick={() => haptic("tap")}
                        className="text-[11px] font-semibold text-primary hover:underline whitespace-nowrap"
                      >
                        {task.cta}
                      </Link>
                    )}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}