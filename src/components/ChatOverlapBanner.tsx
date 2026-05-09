import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Sparkles, X, Clock, Bug, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

interface OverlapInfo {
  city: string;
  overlapDays: number;
  overlapStart: string;
  overlapEnd: string;
}

interface PairDebug {
  mineCity: string;
  theirsCity: string;
  mineRange: string;
  theirsRange: string;
  cityMatch: boolean;
  overlapDays: number;
  matched: boolean;
}

interface OverlapResult {
  overlap: OverlapInfo | null;
  debug: {
    mineCount: number;
    theirsCount: number;
    pairs: PairDebug[];
  };
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
  const [dismissed, setDismissed] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["chat-overlap", user?.id, recipientId],
    queryFn: async (): Promise<OverlapResult> => {
      const empty: OverlapResult = { overlap: null, debug: { mineCount: 0, theirsCount: 0, pairs: [] } };
      if (!user) return empty;
      const [myRes, theirRes] = await Promise.all([
        supabase.from("itineraries").select("*").eq("user_id", user.id),
        supabase.from("itineraries").select("*").eq("user_id", recipientId),
      ]);
      const mine = myRes.data ?? [];
      const theirs = theirRes.data ?? [];
      const debug = { mineCount: mine.length, theirsCount: theirs.length, pairs: [] as PairDebug[] };
      let found: OverlapInfo | null = null;

      for (const m of mine) {
        for (const t of theirs) {
          const cityMatch = m.city_name.toLowerCase() === t.city_name.toLowerCase();
          const result = cityMatch ? calculateOverlapDetails(
            m.arrival_date, m.departure_date,
            t.arrival_date, t.departure_date
          ) : null;
          const days = result?.days ?? 0;
          const matched = cityMatch && days > 0;
          debug.pairs.push({
            mineCity: m.city_name,
            theirsCity: t.city_name,
            mineRange: `${m.arrival_date} → ${m.departure_date}`,
            theirsRange: `${t.arrival_date} → ${t.departure_date}`,
            cityMatch,
            overlapDays: days,
            matched,
          });
          if (matched && result && !found) {
            found = {
              city: m.city_name,
              overlapDays: result.days,
              overlapStart: result.start.toISOString(),
              overlapEnd: result.end.toISOString(),
            };
          }
        }
      }
      return { overlap: found, debug };
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const overlap = data?.overlap ?? null;
  const debug = data?.debug;
  const showDebug = import.meta.env.DEV;

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

  // Debug-only panel renders even when no overlap (dev mode)
  const debugPanel = showDebug && debug && (
    <div className="border-b border-dashed border-amber-500/40 bg-amber-500/5 text-amber-200">
      <button
        onClick={() => setDebugOpen(o => !o)}
        className="flex items-center gap-1.5 w-full px-4 py-1.5 text-[10px] font-mono"
      >
        <Bug className="h-3 w-3" />
        <span className="font-semibold">overlap debug</span>
        <span className="opacity-70">
          mine={debug.mineCount} · theirs={debug.theirsCount} · pairs={debug.pairs.length} · matched={debug.pairs.filter(p => p.matched).length}
        </span>
        {debugOpen ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
      </button>
      {debugOpen && (
        <div className="px-4 pb-2 space-y-1 font-mono text-[10px]">
          {debug.pairs.length === 0 && <div className="opacity-60">No itinerary pairs to compare.</div>}
          {debug.pairs.map((p, i) => (
            <div key={i} className={`rounded px-2 py-1 ${p.matched ? "bg-emerald-500/10 text-emerald-200" : "bg-muted/40"}`}>
              <div>mine: {p.mineCity} [{p.mineRange}]</div>
              <div>them: {p.theirsCity} [{p.theirsRange}]</div>
              <div>
                cityMatch={String(p.cityMatch)} · overlapDays={p.overlapDays} · matched={String(p.matched)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!overlap || dismissed) return <>{debugPanel}</>;

  return (
    <AnimatePresence>
      {debugPanel}
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
