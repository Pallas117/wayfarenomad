import { motion } from "framer-motion";
import { Compass, QrCode, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompassLockGateProps {
  recipientName: string;
  onInitiateVerify: () => void;
  onBack: () => void;
}

/**
 * Shown instead of ChatView when users haven't compass-locked yet.
 * Encourages in-person connection before digital chat.
 */
export function CompassLockGate({ recipientName, onInitiateVerify, onBack }: CompassLockGateProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </Button>
        <div className="flex-1">
          <h2 className="font-display font-semibold">{recipientName}</h2>
          <p className="text-xs text-muted-foreground">Compass Lock required</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative"
        >
          <div className="h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center">
            <Compass className="h-14 w-14 text-primary" />
          </div>
          <motion.div
            className="absolute -top-1 -right-1 h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Lock className="h-5 w-5 text-destructive" />
          </motion.div>
        </motion.div>

        <div className="text-center space-y-2 max-w-sm">
          <h3 className="font-display font-bold text-lg">Compass Lock</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To message <span className="font-semibold text-foreground">{recipientName}</span>, you need to 
            meet them in person first. No more cancel culture. No more flakiness.
          </p>
          <p className="text-xs text-muted-foreground/70 italic">
            "Real connections start face-to-face."
          </p>
        </div>

        <div className="space-y-3 w-full max-w-xs">
          <Button
            onClick={onInitiateVerify}
            className="w-full gradient-gold text-primary-foreground min-h-[52px] gap-2"
          >
            <QrCode className="h-5 w-5" />
            Verify In Person
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5" />
              <span>QR Scan</span>
            </div>
            <span>or</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>GPS Proximity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
