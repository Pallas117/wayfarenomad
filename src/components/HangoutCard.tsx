import { motion } from "framer-motion";
import { Coffee, Laptop, PartyPopper, Bike, MapPin, Clock, Users, UserPlus, UserMinus, MessageCircle, Navigation, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { haptic } from "@/lib/haptics";
import { useNavigate } from "react-router-dom";
import type { Hangout } from "@/hooks/useHangouts";

const categoryConfig: Record<string, { icon: React.ElementType; label: string }> = {
  coffee: { icon: Coffee, label: "Coffee" },
  coworking: { icon: Laptop, label: "Coworking" },
  nightlife: { icon: PartyPopper, label: "Nightlife" },
  activity: { icon: Bike, label: "Activity" },
};

export interface HangoutCardProps {
  hangout: Hangout;
  onJoin: () => void;
  onLeave: () => void;
  onOpenChat: () => void;
  isJoining?: boolean;
  index?: number;
  distance?: number;
}

export function HangoutCard({ hangout, onJoin, onLeave, onOpenChat, isJoining, index = 0, distance }: HangoutCardProps) {
  const navigate = useNavigate();
  const config = categoryConfig[hangout.category] ?? categoryConfig.coffee;
  const CatIcon = config.icon;
  const isFull = hangout.attendee_count >= hangout.max_attendees;
  const hasLocation = hangout.lat && hangout.lng;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 150, damping: 18 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <CatIcon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-display font-semibold text-lg">{hangout.title}</h3>
            <Badge variant="secondary" className="text-xs capitalize">{config.label}</Badge>
          </div>
          {hangout.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{hangout.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            {hangout.location_name && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {hangout.location_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {format(new Date(hangout.hangout_time), "MMM d, h:mm a")}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {hangout.attendee_count}/{hangout.max_attendees}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>by {hangout.creator_name}</span>
            {distance !== undefined && (
              <span className="flex items-center gap-1 text-primary font-medium">
                <Navigation className="h-3 w-3" />
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {hangout.is_attending ? (
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 min-h-[44px] border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => { onLeave(); haptic("tap"); }}
            >
              <UserMinus className="h-4 w-4 mr-1" /> Leave
            </Button>
            <Button
              size="sm"
              className="flex-1 min-h-[44px] gradient-gold text-primary-foreground hover:opacity-90"
              onClick={() => { onOpenChat(); haptic("tap"); }}
            >
              <MessageCircle className="h-4 w-4 mr-1" /> Group Chat
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="flex-1 min-h-[44px] gradient-gold text-primary-foreground hover:opacity-90"
            onClick={() => { onJoin(); haptic("tap"); }}
            disabled={isFull || isJoining}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            {isFull ? "Full" : "Join"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
