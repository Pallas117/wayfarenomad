import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";

interface NomadDebriefModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NomadDebriefModal({ open, onOpenChange }: NomadDebriefModalProps) {
  const { user } = useAuth();
  const [nomadHandle, setNomadHandle] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [featureRequest, setFeatureRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const resetForm = () => {
    setNomadHandle("");
    setLocation("");
    setRating(0);
    setFeatureRequest("");
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit feedback");
      return;
    }
    
    if (rating === 0) {
      toast.error("Please select a vibe rating");
      return;
    }
    
    setSubmitting(true);
    haptic("tap");
    
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        nomad_handle: nomadHandle || null,
        location: location || null,
        rating,
        feature_request: featureRequest || null,
      });
      
      if (error) throw error;
      
      haptic("success");
      setSubmitted(true);
      
      // Auto close after showing success
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 3000);
      
    } catch (err) {
      console.error("Feedback error:", err);
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) resetForm();
    }}>
      <DialogContent className="sm:max-w-md krabi-card border-krabi-teal/30">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-krabi-coral" />
            Nomad Debrief
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 rounded-full krabi-gradient mx-auto mb-4 flex items-center justify-center"
              >
                <Sparkles className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="font-display text-xl font-semibold mb-2">
                Thank you! 🙏
              </h3>
              <p className="text-muted-foreground">
                See you in Krabi 💦
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Nomad Handle */}
              <div className="space-y-2">
                <Label htmlFor="nomad-handle">Nomad Handle</Label>
                <Input
                  id="nomad-handle"
                  placeholder="@yourhandle"
                  value={nomadHandle}
                  onChange={(e) => setNomadHandle(e.target.value)}
                  className="min-h-[48px]"
                />
              </div>

              {/* Current Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Ao Nang, Krabi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="min-h-[48px]"
                />
              </div>

              {/* Vibe Rating */}
              <div className="space-y-2">
                <Label>Vibe Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="p-2 transition-transform hover:scale-110 focus:outline-none"
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setRating(value);
                        haptic("tap");
                      }}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          value <= (hoverRating || rating)
                            ? "fill-krabi-coral text-krabi-coral"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Request */}
              <div className="space-y-2">
                <Label htmlFor="feature-request">What should we add next?</Label>
                <Textarea
                  id="feature-request"
                  placeholder="Your ideas for making Wayfare even better..."
                  value={featureRequest}
                  onChange={(e) => setFeatureRequest(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full min-h-[48px] krabi-button-gradient"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
