import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetupCard3DProps {
  initiator: string;
  location: string;
  time: string;
  travelTime?: string;
  transitMode?: string;
  status: "proposed" | "accepted";
  onAccept?: () => void;
}

export function MeetupCard3D({
  initiator, location, time, travelTime, transitMode, status, onAccept,
}: MeetupCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(status === "accepted");

  const handleAccept = () => {
    setIsFlipped(true);
    onAccept?.();
  };

  return (
    <div className="perspective-[1000px] h-[200px]">
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15, duration: 0.8 }}
      >
        {/* Front face - Proposed */}
        <div
          className="absolute inset-0 glass-card rounded-xl p-5 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <p className="text-xs text-primary font-medium mb-1">Meetup Proposal</p>
            <h3 className="font-display font-semibold text-lg">{initiator}</h3>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {time}</span>
            </div>
            {travelTime && (
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full gradient-gold rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {travelTime} {transitMode && `(${transitMode})`}
                </p>
              </div>
            )}
          </div>
          {!isFlipped && (
            <Button
              onClick={handleAccept}
              className="w-full gradient-gold text-primary-foreground mt-3 min-h-[44px]"
            >
              <Check className="h-4 w-4 mr-2" /> Accept Meetup
            </Button>
          )}
        </div>

        {/* Back face - Accepted */}
        <div
          className="absolute inset-0 glass-card rounded-xl p-5 flex flex-col items-center justify-center gap-4 border-primary/30"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <motion.div
            className="h-14 w-14 rounded-full gradient-gold flex items-center justify-center glow-gold"
            initial={{ scale: 0 }}
            animate={isFlipped ? { scale: 1 } : {}}
            transition={{ delay: 0.4, type: "spring" }}
          >
            <Check className="h-7 w-7 text-primary-foreground" />
          </motion.div>
          <p className="font-display font-semibold text-lg">Meetup Confirmed!</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs min-h-[44px]">
              <Calendar className="h-3 w-3 mr-1" /> Add to Calendar
            </Button>
            <Button size="sm" variant="outline" className="text-xs min-h-[44px]">
              <ExternalLink className="h-3 w-3 mr-1" /> Transit Ticket
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
