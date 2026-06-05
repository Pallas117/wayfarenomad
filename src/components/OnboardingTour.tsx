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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/85 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-md border border-primary bg-card p-1"
        >
          {/* Corner brackets */}
          <span aria-hidden className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-primary" />
          <span aria-hidden className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-primary" />
          <span aria-hidden className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-primary" />
          <span aria-hidden className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-primary" />

          <div className="border border-primary/20 p-6 flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between mb-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/60">
                Entry No. {String(step + 1).padStart(3, "0")} · {s.badge}
              </span>
              <button
                onClick={finish}
                className="font-mono text-[10px] uppercase tracking-widest text-primary/50 hover:text-primary transition-colors"
                aria-label="Skip onboarding tour"
              >
                Skip
              </button>
            </div>

            <div className="w-14 h-14 border border-primary flex items-center justify-center mb-6 relative">
              <span aria-hidden className="absolute inset-1 border border-primary/20" />
              <Icon className="h-6 w-6 text-primary" />
            </div>

            <h2 className="font-display text-xl font-bold tracking-[0.12em] uppercase text-foreground mb-3">
              {s.title}
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground max-w-[260px] mb-7">
              {s.description}
            </p>

            <div className="flex gap-1.5 mb-7" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 transition-all duration-200 ${
                    i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/60" : "w-4 bg-primary/20"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={next}
              className="w-full min-h-[44px] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold uppercase tracking-[0.2em] text-xs gap-2 active:scale-[0.98] transition-transform"
            >
              {step < STEPS.length - 1 ? (
                <>Next <ArrowRight className="h-4 w-4" strokeWidth={2.5} /></>
              ) : (
                <>Begin Your Journey <Sparkles className="h-4 w-4" strokeWidth={2} /></>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}