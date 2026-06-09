import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Save, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptics";

export function GoogleGuideLinks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [level, setLevel] = useState<string>("");
  const [points, setPoints] = useState<string>("");
  const [reviews, setReviews] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("google_guide_url, google_guide_level, google_guide_points, google_guide_reviews")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        const p = data as any;
        if (!p) return;
        setUrl(p.google_guide_url ?? "");
        setLevel(p.google_guide_level != null ? String(p.google_guide_level) : "");
        setPoints(p.google_guide_points != null ? String(p.google_guide_points) : "");
        setReviews(p.google_guide_reviews != null ? String(p.google_guide_reviews) : "");
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    const lvl = level ? parseInt(level, 10) : null;
    const pts = points ? parseInt(points, 10) : null;
    const rev = reviews ? parseInt(reviews, 10) : null;
    if (lvl !== null && (isNaN(lvl) || lvl < 1 || lvl > 10)) {
      toast({ title: "Invalid level", description: "Local Guides level must be 1–10.", variant: "destructive" });
      return;
    }
    if (url && !/^https?:\/\/.+/.test(url)) {
      toast({ title: "Invalid URL", description: "Use the full https:// link to your Google Maps contributions.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        google_guide_url: url || null,
        google_guide_level: lvl,
        google_guide_points: pts,
        google_guide_reviews: rev,
      } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      haptic("success");
      toast({ title: "Google Local Guides updated ✦" });
    }
  };

  return (
    <motion.div
      className="glass-card rounded-xl p-5 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Google Local Guides</h2>
        </div>
        {level && (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Star className="h-3 w-3 mr-1" /> Lvl {level}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Show off your Google Local Guides badge. Find your level &amp; points at{" "}
        <a href="https://www.google.com/maps/contrib" target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-0.5 underline">
          maps.google.com/contrib <ExternalLink className="h-3 w-3" />
        </a>
      </p>

      <div className="space-y-3">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.google.com/maps/contrib/123…"
          className="bg-secondary/50 border-border text-sm"
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={level}
            onChange={(e) => setLevel(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
            placeholder="Level"
            inputMode="numeric"
            className="bg-secondary/50 border-border text-sm"
          />
          <Input
            value={points}
            onChange={(e) => setPoints(e.target.value.replace(/[^0-9]/g, "").slice(0, 9))}
            placeholder="Points"
            inputMode="numeric"
            className="bg-secondary/50 border-border text-sm"
          />
          <Input
            value={reviews}
            onChange={(e) => setReviews(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="Reviews"
            inputMode="numeric"
            className="bg-secondary/50 border-border text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="sm" className="gradient-gold text-primary-foreground">
          <Save className="h-3 w-3 mr-1" />
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </motion.div>
  );
}