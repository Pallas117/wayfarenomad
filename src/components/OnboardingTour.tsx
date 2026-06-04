import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, MessageSquare, Sun, ShieldCheck, Trophy, Users, Radio, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";

const STORAGE_KEY = "wayfare-onboarding-tour-v1";

type Step = {
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    icon: Sparkles,
    badge: "Welcome",
    title: "Welcome to Wayfare",
    description: "A pocket compass for nomads. Here's a quick tour of the constellation.",
  },
  {
    icon: Compass,
    badge: "Social",
    title: "Find Your Tribe",
    description: "Discover nearby nomads, match itineraries, and swap stories with fellow travellers.",
  },
  {
    icon: MessageSquare,
    badge: "Chat",
    title: "Encrypted Conversations",
    description: "Private, end-to-end encrypted messages. Unlock new chats via Compass Lock when you meet IRL.",
  },
  {
    icon: Sun,
    badge: "Pulse",
    title: "Live Community Pulse",
    description: "Real-time map of events, hangouts, and Luma meetups — auto-scraped and verified by the community.",
  },
  {
    icon: Radio,
    badge: "Meet-Sync",
    title: "Meet-Sync Portal",
    description: "Same city, same dates? Tap Meet-Sync from Social to instantly surface overlapping nomads.",
  },
  {
    icon: ShieldCheck,
    badge: "Safety",
    title: "Safety Hub",
    description: "SOS beacon, community photo board, and trusted resources — always one tap away.",
  },
  {
    icon: Trophy,
    badge: "Leaderboard",
    title: "Stardust Karma",
    description: "Earn Stardust by helping the community. Rise from Initiate to Steward to Captain.",
  },
];

export function hasSeenOnboardingTour(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!hasSeenOnboardingTour()) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = () => {
    haptic("tap");
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const next = () => {
    haptic("tap");
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  if (!open) return null;

  const s = STEPS[step];
  const Icon = s.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.28 }}
          className="w-full max-w-md rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-primary/80">
              {s.badge}
            </span>
            <button
              onClick={finish}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Skip onboarding tour"
            >
              Skip
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <motion.div
              className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 glow-gold"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 240 }}
            >
              <Icon className="h-7 w-7 text-primary" />
            </motion.div>
            <h2 className="font-display text-2xl text-foreground mb-2">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
          </div>

          <div className="flex justify-center gap-1.5 mt-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          <Button onClick={next} className="w-full mt-6 min-h-[48px] gap-2">
            {step < STEPS.length - 1 ? (
              <>Next <ArrowRight className="h-4 w-4" /></>
            ) : (
              <>Begin Your Journey <Sparkles className="h-4 w-4" /></>
            )}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}