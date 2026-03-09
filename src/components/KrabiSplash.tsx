import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, MapPin, Users, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";

const SLIDES = [
  {
    icon: Droplets,
    emoji: "💦",
    title: "Welcome to Krabi",
    subtitle: "Songkran 2024",
    description: "Your pocket guide to Thailand's wildest water festival — built by nomads, for nomads.",
  },
  {
    icon: MapPin,
    emoji: "📍",
    title: "Survival Map",
    subtitle: "Navigate Like a Local",
    description: "Find meetup spots, dry co-working zones, and safe routes through the splash zone.",
  },
  {
    icon: Users,
    emoji: "🤝",
    title: "Connect & RSVP",
    subtitle: "Join the Tribe",
    description: "RSVP for the Wayfare Sunset Meetup and share your Nomad Passport QR to network IRL.",
  },
];

const STORAGE_KEY = "krabi-onboarding-seen";

interface KrabiSplashProps {
  onComplete: () => void;
}

export function KrabiSplash({ onComplete }: KrabiSplashProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    haptic("tap");
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    haptic("tap");
    localStorage.setItem(STORAGE_KEY, "true");
    onComplete();
  };

  const slide = SLIDES[step];
  const SlideIcon = slide.icon;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center krabi-theme"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 krabi-gradient" />
      
      {/* Animated water drops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: 4 + Math.random() * 8,
              height: 4 + Math.random() * 8,
              left: `${Math.random() * 100}%`,
              top: -20,
            }}
            animate={{
              y: [0, window.innerHeight + 40],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8 max-w-sm text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center"
          >
            {/* Icon circle */}
            <motion.div
              className="w-24 h-24 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/20"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.15 }}
            >
              <span className="text-5xl">{slide.emoji}</span>
            </motion.div>

            {/* Badge */}
            <motion.span
              className="inline-block text-xs font-semibold tracking-widest uppercase text-white/60 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {slide.subtitle}
            </motion.span>

            {/* Title */}
            <motion.h1
              className="text-3xl font-display font-bold text-white mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-white/75 text-sm leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-2 mt-10 mb-8">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-white" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <Button
            onClick={handleNext}
            className="w-full min-h-[52px] krabi-button-gradient text-base font-semibold gap-2"
          >
            {step < SLIDES.length - 1 ? (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Let's Go!
              </>
            )}
          </Button>

          {step < SLIDES.length - 1 && (
            <button
              onClick={handleSkip}
              className="text-sm text-white/50 hover:text-white/80 transition-colors w-full py-2"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function hasSeenKrabiOnboarding(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}
