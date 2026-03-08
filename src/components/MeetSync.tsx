import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptics";
import { MeetupCard3D } from "@/components/animations/MeetupCard3D";

interface MeetSyncProps {
  recipientId: string;
  recipientName: string;
  city: string;
  onClose: () => void;
}

export function MeetSync({ recipientId, recipientName, city, onClose }: MeetSyncProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("14:00");
  const [venue, setVenue] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const travelTime = Math.floor(Math.random() * 25) + 5; // Simulated
  const transitMode = travelTime > 15 ? "Transit" : "Walk";

  const handlePropose = async () => {
    if (!user || !date || !time) return;
    setSending(true);

    const scheduledTime = new Date(`${date}T${time}:00`).toISOString();

    const { error } = await supabase.from("instant_meetups").insert({
      initiator_id: user.id,
      recipient_id: recipientId,
      scheduled_time: scheduledTime,
      transit_mode: transitMode.toLowerCase(),
      travel_time_minutes: travelTime,
    });

    setSending(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    haptic("success");
    setSent(true);
  };

  // Google Calendar link
  const calendarUrl = date && time
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meetup+with+${encodeURIComponent(recipientName)}&dates=${date.replace(/-/g, "")}T${time.replace(":", "")}00/${date.replace(/-/g, "")}T${(parseInt(time.split(":")[0]) + 1).toString().padStart(2, "0")}${time.split(":")[1]}00&details=Nomad+Community+Meetup&location=${encodeURIComponent(venue || city)}`
    : "#";

  // Transit link (Trainline/Omio/Google Maps)
  const transitUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue || city)}&travelmode=${transitMode === "Walk" ? "walking" : "transit"}`;

  if (sent) {
    return (
      <div className="space-y-3">
        <MeetupCard3D
          initiator={recipientName}
          location={venue || city}
          time={`${date} ${time}`}
          travelTime={`${travelTime}min`}
          transitMode={transitMode}
          status="accepted"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 min-h-[44px]" asChild>
            <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
              <Calendar className="h-4 w-4 mr-1" /> Add to Calendar
            </a>
          </Button>
          <Button size="sm" variant="outline" className="flex-1 min-h-[44px]" asChild>
            <a href={transitUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="h-4 w-4 mr-1" /> Get Directions
            </a>
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose} className="w-full min-h-[44px]">
          Close
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card rounded-xl p-5 space-y-4"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">
          Meet {recipientName}
        </h3>
        <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">✕</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-secondary/50 border-border min-h-[44px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Time</label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-secondary/50 border-border min-h-[44px]"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Venue (optional)</label>
        <Input
          placeholder={`Cafe in ${city}...`}
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className="bg-secondary/50 border-border min-h-[44px]"
        />
      </div>

      {/* Travel time indicator */}
      <div className="flex items-center gap-3 bg-secondary/30 rounded-lg px-3 py-2">
        <Clock className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full gradient-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(travelTime * 4, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </div>
        <span className="text-xs font-medium text-foreground whitespace-nowrap">
          {travelTime}m {transitMode.toLowerCase()}
        </span>
      </div>

      {/* Transit links */}
      <div className="flex gap-2 text-xs">
        <a href={transitUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
          <ExternalLink className="h-3 w-3" /> Google Maps
        </a>
        <a href={`https://www.thetrainline.com/book/results?origin=${encodeURIComponent(city)}&destination=${encodeURIComponent(venue || city)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
          <ExternalLink className="h-3 w-3" /> Trainline
        </a>
        <a href={`https://www.omio.com/search?from=${encodeURIComponent(city)}&to=${encodeURIComponent(venue || city)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
          <ExternalLink className="h-3 w-3" /> Omio
        </a>
      </div>

      <Button
        onClick={handlePropose}
        disabled={!date || sending}
        className="w-full gradient-gold text-primary-foreground min-h-[44px]"
      >
        {sending ? "Sending..." : "Propose Meetup"}
      </Button>
    </motion.div>
  );
}
