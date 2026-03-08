import { useState } from "react";
import { ShieldCheck, CheckCircle, Users, AlertTriangle, ExternalLink, Loader2, RefreshCw, Flame, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleGate } from "@/components/RoleGate";
import { catStyle, catIconStyle } from "@/lib/categoryColors";
import { motion } from "framer-motion";

interface AdminEvent {
  id: string;
  title: string;
  category: string;
  city: string;
  description: string | null;
  event_date: string | null;
  venue: string | null;
  source_url: string | null;
  verification_status: string;
  community_verify_count: number;
  star_count: number;
  like_count: number;
  flag_count: number;
  is_user_submitted: boolean;
}

function AdminVerifyContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [promoting, setPromoting] = useState<string | null>(null);

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-verify-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, category, city, description, event_date, venue, source_url, verification_status, community_verify_count, star_count, like_count, flag_count, is_user_submitted")
        .order("community_verify_count", { ascending: false });
      if (error) throw error;
      return (data as any[]) as AdminEvent[];
    },
  });

  const communityVerified = events.filter(e => e.verification_status === "community_verified");
  const scraped = events.filter(e => e.verification_status === "scraped");
  const adminVerified = events.filter(e => e.verification_status === "admin_verified");
  const flagged = events.filter(e => e.flag_count >= 2);

  const handlePromote = async (eventId: string) => {
    if (!user) return;
    setPromoting(eventId);
    const { error } = await supabase
      .from("events")
      .update({ verified: true, verified_by: user.id, verification_status: "admin_verified" } as any)
      .eq("id", eventId);

    if (!error) {
      toast({ title: "✅ Admin Verified", description: "Event promoted to fully verified." });
      queryClient.invalidateQueries({ queryKey: ["admin-verify-events"] });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setPromoting(null);
  };

  const handleDelete = async (eventId: string) => {
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (!error) {
      toast({ title: "Event Removed" });
      queryClient.invalidateQueries({ queryKey: ["admin-verify-events"] });
    }
  };

  const EventRow = ({ event, showPromote }: { event: AdminEvent; showPromote: boolean }) => {
    const cStyle = catStyle(event.category);
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-4 border-l-[3px] space-y-2"
        style={{ borderLeftColor: cStyle.color }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-sm truncate">{event.title}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Badge className="text-[10px] capitalize border" style={cStyle}>{event.category}</Badge>
              <Badge variant="outline" className="text-[10px]">{event.city}</Badge>
              {event.is_user_submitted && (
                <Badge className="text-[10px]" style={{ backgroundColor: "hsl(var(--cat-alien) / 0.15)", color: "hsl(var(--cat-alien))" }}>👽 Community Pick</Badge>
              )}
              {event.flag_count >= 2 && (
                <Badge variant="destructive" className="text-[10px]">🚩 {event.flag_count} flags</Badge>
              )}
            </div>
          </div>
          {event.source_url && (
            <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground shrink-0">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {event.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
        )}

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>⭐ {event.star_count}</span>
            <span>❤️ {event.like_count}</span>
            <span><Users className="inline h-2.5 w-2.5" /> {event.community_verify_count} verifications</span>
            {event.venue && <span>📍 {event.venue}</span>}
            {event.event_date && <span>📅 {event.event_date}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {showPromote && (
            <Button
              size="sm"
              className="h-7 text-[11px] gap-1 gradient-gold"
              onClick={() => handlePromote(event.id)}
              disabled={promoting === event.id}
            >
              {promoting === event.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
              Admin Verify
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            className="h-7 text-[11px]"
            onClick={() => handleDelete(event.id)}
          >
            Remove
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="font-display text-lg font-bold">Verification Dashboard</h1>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Awaiting Review", count: communityVerified.length, icon: Users, color: "hsl(var(--cat-wellbeing))" },
          { label: "Auto-scraped", count: scraped.length, icon: AlertTriangle, color: "hsl(var(--cat-entertainment))" },
          { label: "Admin Verified", count: adminVerified.length, icon: ShieldCheck, color: "hsl(var(--primary))" },
          { label: "Flagged", count: flagged.length, icon: Flame, color: "hsl(var(--destructive))" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-3 text-center">
            <s.icon className="h-4 w-4 mx-auto mb-1" style={{ color: s.color }} />
            <div className="text-lg font-display font-bold">{s.count}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="review">
        <TabsList className="w-full">
          <TabsTrigger value="review" className="flex-1 text-xs gap-1">
            <Users className="h-3 w-3" /> Review ({communityVerified.length})
          </TabsTrigger>
          <TabsTrigger value="scraped" className="flex-1 text-xs gap-1">
            <AlertTriangle className="h-3 w-3" /> Scraped ({scraped.length})
          </TabsTrigger>
          <TabsTrigger value="verified" className="flex-1 text-xs gap-1">
            <ShieldCheck className="h-3 w-3" /> Verified ({adminVerified.length})
          </TabsTrigger>
          <TabsTrigger value="flagged" className="flex-1 text-xs gap-1">
            <Flame className="h-3 w-3" /> Flagged ({flagged.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-3 mt-3">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : communityVerified.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No events awaiting admin review.</div>
          ) : (
            communityVerified.map(e => <EventRow key={e.id} event={e} showPromote />)
          )}
        </TabsContent>

        <TabsContent value="scraped" className="space-y-3 mt-3">
          {scraped.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No auto-scraped events.</div>
          ) : (
            scraped.map(e => <EventRow key={e.id} event={e} showPromote />)
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-3 mt-3">
          {adminVerified.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No verified events yet.</div>
          ) : (
            adminVerified.map(e => <EventRow key={e.id} event={e} showPromote={false} />)
          )}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-3 mt-3">
          {flagged.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No flagged events.</div>
          ) : (
            flagged.map(e => <EventRow key={e.id} event={e} showPromote={false} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminVerify() {
  return (
    <RoleGate minRank={3}>
      <AdminVerifyContent />
    </RoleGate>
  );
}
