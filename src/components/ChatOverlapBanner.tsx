import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Sparkles, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

interface OverlapInfo {
  city: string;
  overlapDays: number;
  overlapStart: string;
  overlapEnd: string;
}

function calculateOverlapDetails(
  startA: string, endA: string,
  startB: string, endB: string
): { days: number; start: Date; end: Date } | null {
  const a0 = new Date(startA).getTime();
  const a1 = new Date(endA).getTime();
  const b0 = new Date(startB).getTime();
  const b1 = new Date(endB).getTime();
  const overlapStart = Math.max(a0, b0);
  const overlapEnd = Math.min(a1, b1);
  if (overlapEnd <= overlapStart) return null;
  return {
    days: Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)),
    start: new Date(overlapStart),
    end: new Date(overlapEnd),
  };
}

export function ChatOverlapBanner({ recipientId }: { recipientId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const { data: overlap } = useQuery({
    queryKey: ["chat-overlap", user?.id, recipientId],
    queryFn: async (): Promise<OverlapInfo | null> => {
      if (!user) return null;
      const [myRes, theirRes] = await Promise.all([
        supabase.from("itineraries").select("*").eq("user_id", user.id),
        supabase.from("itineraries").select("*").eq("user_id", recipientId),
      ]);
      if (!myRes.data?.length || !theirRes.data?.length) return null;

      for (const mine of myRes.data) {
        for (const theirs of theirRes.data) {
          if (mine.city_name.toLowerCase() !== theirs.city_name.toLowerCase()) continue;
          const result = calculateOverlapDetails(
            mine.arrival_date, mine.departure_date,
            theirs.arrival_date, theirs.departure_date
          );
          if (result && result.days > 0) {
            return {
              city: mine.city_name,
              overlapDays: result.days,
              overlapStart: result.start.toISOString(),
              overlapEnd: result.end.toISOString(),
            };
          }
        }
      }
      return null;
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const createMeetup = useMutation({
    mutationFn: async () => {
      if (!user || !overlap) throw new Error("Missing data");
      // Suggest meeting midway through the overlap
      const start = new Date(overlap.overlapStart);
      const suggestedTime = addDays(start, Math.floor(overlap.overlapDays / 2));
      suggestedTime.setHours(10, 0, 0, 0);

      const { error } = await supabase.from("instant_meetups").insert({
        initiator_id: user.id,
        recipient_id: recipientId,
        scheduled_time: suggestedTime.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Meetup suggested! ✨", description: "They'll see your invitation." });
      setScheduling(false);
      setDismissed(true);
    },
    onError: (err) => {
      toast({ title: "Failed", description: String(err), variant: "destructive" });
    },
  });

  if (!overlap || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="border-b border-border"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">
              You'll both be in <span className="text-primary font-semibold">{overlap.city}</span> for{" "}
              <span className="text-primary font-semibold">{overlap.overlapDays} days</span>!
            </p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="h-2.5 w-2.5" />
              {format(new Date(overlap.overlapStart), "MMM d")} – {format(new Date(overlap.overlapEnd), "MMM d")}
            </p>
          </div>
          {!scheduling ? (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                className="h-7 text-[10px] px-2.5 gradient-gold text-primary-foreground"
                onClick={() => setScheduling(true)}
              >
                <MapPin className="h-3 w-3 mr-0.5" />Meet up?
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setDismissed(true)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                className="h-7 text-[10px] px-2.5 gradient-gold text-primary-foreground"
                onClick={() => createMeetup.mutate()}
                disabled={createMeetup.isPending}
              >
                <Clock className="h-3 w-3 mr-0.5" />
                {createMeetup.isPending ? "Sending…" : "Suggest time"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] px-1"
                onClick={() => setScheduling(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
