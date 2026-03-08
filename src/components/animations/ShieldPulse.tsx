import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";

interface ShieldPulseProps {
  visible: boolean;
  onComplete?: () => void;
}

export function ShieldPulse({ visible, onComplete }: ShieldPulseProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Radial pulse rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-primary/30"
              initial={{ width: 60, height: 60, opacity: 0.8 }}
              animate={{ width: 300, height: 300, opacity: 0 }}
              transition={{ duration: 1.5, delay: i * 0.3, ease: "easeOut" }}
            />
          ))}

          {/* Shield icon */}
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="h-16 w-16 rounded-2xl gradient-gold flex items-center justify-center glow-gold-strong">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <motion.p
              className="text-sm font-display font-semibold text-primary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              AES-256 Secured
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
