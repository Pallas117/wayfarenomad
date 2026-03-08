import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scroll, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/haptics";

const MOU_KEY = "nomad-mou-accepted";

export function MOUAgreement() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    const accepted = localStorage.getItem(`${MOU_KEY}-${user.id}`);
    if (!accepted) {
      setVisible(true);
    }
  }, [user]);

  const handleAccept = () => {
    if (!user) return;
    localStorage.setItem(`${MOU_KEY}-${user.id}`, new Date().toISOString());
    haptic("success");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />

          <motion.div
            className="relative glass-card rounded-2xl p-6 max-w-md w-full space-y-5 border border-primary/20"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-gold flex items-center justify-center">
                <Scroll className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">Community Agreement</h2>
                <p className="text-xs text-muted-foreground">Memorandum of Understanding</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground max-h-[50vh] overflow-y-auto pr-2">
              <p className="font-medium text-foreground">By using this platform, you agree to:</p>

              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p><strong className="text-foreground">Safety First</strong> — Respond to emergency beacons when able. No one gets left behind.</p>
                </div>
                <div className="flex gap-2">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p><strong className="text-foreground">Respect & Integrity</strong> — Treat all community members with dignity regardless of background, culture, or belief system.</p>
                </div>
                <div className="flex gap-2">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p><strong className="text-foreground">Privacy</strong> — Never share another member's location, personal details, or encrypted communications.</p>
                </div>
                <div className="flex gap-2">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p><strong className="text-foreground">Accuracy</strong> — Verify information before sharing. Report inaccuracies for Stardust credit.</p>
                </div>
                <div className="flex gap-2">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p><strong className="text-foreground">No Exploitation</strong> — The marketplace is for fair exchange. Price gouging, scams, and misleading listings result in permanent removal.</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground/70 pt-2">
                Violations may result in rank demotion, Stardust penalties, or permanent ban. 
                This agreement is binding from the moment of acceptance.
              </p>
            </div>

            <Button
              onClick={handleAccept}
              className="w-full gradient-gold text-primary-foreground min-h-[48px] text-base font-semibold"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              I Agree — Enter the Community
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
