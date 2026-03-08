import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BeaconGlowProps {
  active: boolean;
  children: React.ReactNode;
  className?: string;
}

export function BeaconGlow({ active, children, className }: BeaconGlowProps) {
  return (
    <div className={cn("relative inline-flex", className)}>
      {active && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0px hsla(43, 72%, 52%, 0)",
                "0 0 20px hsla(43, 72%, 52%, 0.4)",
                "0 0 0px hsla(43, 72%, 52%, 0)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -inset-1 rounded-full border border-primary/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
      {children}
    </div>
  );
}
