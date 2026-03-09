import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, Shield, ShieldCheck, MapPin, Calendar,
  MessageCircle, Send, Instagram, ExternalLink, CheckCircle2, Compass,
  Heart, Zap, Users, QrCode, Share2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TravelLoader } from "@/components/animations/TravelLoader";
import { haptic } from "@/lib/haptics";
import { useIsCompassLocked } from "@/hooks/useCompassLock";
import { CompassVerifySheet } from "@/components/CompassLock";
import { formatDistanceToNow } from "date-fns";

interface ProfileData {
  user_id: string;
  display_name: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  current_city: string | null;
  teaches: string[] | null;
  learns: string[] | null;
  stardust_points: number | null;
  vision_completed: boolean | null;
  quiz_completed: boolean | null;
  social_verified: boolean | null;
  instagram_handle: string | null;
  telegram_handle: string | null;
  whatsapp_number: string | null;
  substack_url: string | null;
  travel_start: string | null;
  travel_end: string | null;
  vision_statement: string | null;
  bridge: string | null;
}

interface UserRankData {
  rank: number;
  label: string;
}

const RANK_LABELS: Record<number, string> = {
  0: "Initiate",
  1: "Steward",
  2: "Captain",
  3: "Admin",
};

const RANK_COLORS: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-primary/20 text-primary",
  2: "gradient-gold text-primary-foreground",
  3: "bg-destructive/20 text-destructive",
};

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [rankData, setRankData] = useState<UserRankData>({ rank: 0, label: "Initiate" });
  const [loading, setLoading] = useState(true);
  const [karmaActivity, setKarmaActivity] = useState<any[]>([]);
  const isOwnProfile = user?.id === userId;
  const { data: isCompassLocked } = useIsCompassLocked(userId ?? null);
  const [showCompassVerify, setShowCompassVerify] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);

      const [profileRes, rankRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.rpc("get_user_rank", { _user_id: userId }),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as ProfileData);
      }

      const r = (rankRes.data as number) ?? 0;
      setRankData({ rank: r, label: RANK_LABELS[r] ?? "Initiate" });

      // Load karma activity
      const [verRes, sosRes, safeRes] = await Promise.all([
        supabase.from("community_verifications").select("id, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
        supabase.from("sos_responses").select("id, created_at").eq("responder_id", userId).order("created_at", { ascending: false }).limit(5),
        supabase.from("safe_spaces").select("id, created_at, name").eq("created_by", userId).order("created_at", { ascending: false }).limit(5),
      ]);

      const activity: any[] = [];
      verRes.data?.forEach(v => activity.push({ id: v.id, type: "verify", label: "Verified an event", points: 5, time: v.created_at }));
      sosRes.data?.forEach(s => activity.push({ id: s.id, type: "sos", label: "Responded to SOS", points: 10, time: s.created_at }));
      safeRes.data?.forEach(s => activity.push({ id: s.id, type: "safe", label: `Added "${s.name}"`, points: 8, time: s.created_at }));
      activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setKarmaActivity(activity.slice(0, 10));

      setLoading(false);
    };

    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 max-w-lg mx-auto pb-24">
        <TravelLoader message="Loading profile…" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-lg mx-auto pb-24 text-center">
        <p className="text-muted-foreground">Profile not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const name = profile.display_name || profile.full_name || "Traveler";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const socialCount = [profile.instagram_handle, profile.telegram_handle, profile.whatsapp_number, profile.substack_url].filter(Boolean).length;

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-display font-bold">Profile</h1>
      </motion.div>

      {/* Avatar & Name Card */}
      <motion.div
        className="glass-card rounded-2xl p-6 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center gap-4 mb-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={name}
              className="h-20 w-20 rounded-full object-cover shrink-0 glow-gold"
            />
          ) : (
            <div className="h-20 w-20 rounded-full gradient-gold flex items-center justify-center text-primary-foreground font-display font-bold text-2xl shrink-0 glow-gold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-xl truncate">{name}</h2>
            {profile.current_city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{profile.current_city}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-xs ${RANK_COLORS[rankData.rank] ?? RANK_COLORS[0]}`}>
                {rankData.rank >= 2 ? <ShieldCheck className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                {rankData.label}
              </Badge>
              {profile.social_verified && (
                <Badge className="text-xs bg-primary/20 text-primary">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
              {isCompassLocked && (
                <Badge className="text-xs bg-accent/20 text-accent-foreground">
                  <Compass className="h-3 w-3 mr-1" /> Met IRL
                </Badge>
              )}
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}

        {profile.vision_statement && (
          <div className="mt-3 p-3 rounded-lg bg-secondary/30 border border-border">
            <p className="text-xs text-muted-foreground mb-1 subheading">Vision</p>
            <p className="text-sm font-vision italic text-foreground/90">"{profile.vision_statement}"</p>
          </div>
        )}
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-card rounded-xl p-4 text-center">
          <Star className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-display font-bold">{profile.stardust_points ?? 0}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stardust</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-display font-bold">{rankData.rank}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rank</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-display font-bold">{socialCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Linked</p>
        </div>
      </motion.div>

      {/* Skills */}
      {((profile.teaches && profile.teaches.length > 0) || (profile.learns && profile.learns.length > 0)) && (
        <motion.div
          className="glass-card rounded-xl p-5 mb-4 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-sm font-display font-semibold subheading">Skills</h3>
          {profile.teaches && profile.teaches.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Teaches:</span>
              {profile.teaches.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          )}
          {profile.learns && profile.learns.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Learns:</span>
              {profile.learns.map((s) => (
                <Badge key={s} variant="outline" className="text-xs border-primary/30 text-primary">{s}</Badge>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Travel Dates */}
      {(profile.travel_start || profile.travel_end) && (
        <motion.div
          className="glass-card rounded-xl p-5 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-display font-semibold subheading mb-2">Travel Window</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{profile.travel_start ?? "—"}</span>
            <span>→</span>
            <span>{profile.travel_end ?? "—"}</span>
          </div>
        </motion.div>
      )}

      {/* Linked Social Accounts */}
      <motion.div
        className="glass-card rounded-xl p-5 mb-4 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold subheading">Social Links</h3>
          {profile.social_verified && (
            <Badge className="text-[10px] bg-primary/20 text-primary">
              <CheckCircle2 className="h-3 w-3 mr-0.5" /> Verified
            </Badge>
          )}
        </div>

        {socialCount === 0 ? (
          <p className="text-xs text-muted-foreground">No social accounts linked yet.</p>
        ) : (
          <div className="space-y-2">
            {profile.instagram_handle && (
              <a
                href={`https://instagram.com/${profile.instagram_handle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <Instagram className="h-4 w-4 text-primary" />
                <span className="text-sm flex-1">@{profile.instagram_handle.replace("@", "")}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            )}
            {profile.telegram_handle && (
              <a
                href={`https://t.me/${profile.telegram_handle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <Send className="h-4 w-4 text-primary" />
                <span className="text-sm flex-1">@{profile.telegram_handle.replace("@", "")}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            )}
            {profile.whatsapp_number && (
              <a
                href={`https://wa.me/${profile.whatsapp_number.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-sm flex-1">{profile.whatsapp_number}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            )}
            {profile.substack_url && (
              <a
                href={profile.substack_url.startsWith("http") ? profile.substack_url : `https://${profile.substack_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-primary" />
                <span className="text-sm flex-1 truncate">{profile.substack_url}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            )}
          </div>
        )}
      </motion.div>

      {/* Progression Badges */}
      <motion.div
        className="glass-card rounded-xl p-5 mb-4 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-display font-semibold subheading">Achievements</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant={profile.vision_completed ? "default" : "secondary"} className={`text-xs ${profile.vision_completed ? "bg-primary/20 text-primary" : ""}`}>
            {profile.vision_completed ? "✦ " : "○ "}Vision Quest
          </Badge>
          <Badge variant={profile.quiz_completed ? "default" : "secondary"} className={`text-xs ${profile.quiz_completed ? "bg-primary/20 text-primary" : ""}`}>
            {profile.quiz_completed ? "✦ " : "○ "}Integrity Quiz
          </Badge>
          <Badge variant={profile.social_verified ? "default" : "secondary"} className={`text-xs ${profile.social_verified ? "bg-primary/20 text-primary" : ""}`}>
            {profile.social_verified ? "✦ " : "○ "}Social Verified
          </Badge>
          {rankData.rank >= 1 && (
            <Badge className="text-xs bg-primary/20 text-primary">✦ Steward</Badge>
          )}
          {rankData.rank >= 2 && (
            <Badge className="text-xs gradient-gold text-primary-foreground">✦ Captain</Badge>
          )}
        </div>
      </motion.div>

      {/* Karma Activity */}
      {karmaActivity.length > 0 && (
        <motion.div
          className="glass-card rounded-xl p-5 mb-4 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <h3 className="text-sm font-display font-semibold subheading">Karma Activity</h3>
          <div className="space-y-2">
            {karmaActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-xs">
                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                  {a.type === "verify" ? <CheckCircle2 className="h-3 w-3 text-primary" /> :
                   a.type === "sos" ? <Shield className="h-3 w-3 text-destructive" /> :
                   <Heart className="h-3 w-3 text-primary" />}
                </div>
                <span className="flex-1 text-muted-foreground">{a.label}</span>
                <span className="flex items-center gap-0.5 text-primary font-display font-bold">
                  <Zap className="h-3 w-3" />+{a.points}
                </span>
                <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(a.time), { addSuffix: true })}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {!isOwnProfile && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {!isCompassLocked && (
            <Button
              className="w-full gradient-gold text-primary-foreground min-h-[48px] gap-2"
              onClick={() => {
                setShowCompassVerify(true);
                haptic("tap");
              }}
            >
              <Compass className="h-4 w-4" /> Compass Lock — Verify In Person
            </Button>
          )}
          <div className="flex gap-3">
            <Button
              className={`flex-1 min-h-[48px] ${isCompassLocked ? "gradient-gold text-primary-foreground" : ""}`}
              variant={isCompassLocked ? "default" : "outline"}
              disabled={!isCompassLocked}
              onClick={() => {
                navigate(`/messages?to=${userId}&name=${encodeURIComponent(name)}`);
                haptic("tap");
              }}
            >
              <Send className="h-4 w-4 mr-2" /> {isCompassLocked ? "Message" : "🔒 Message"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 min-h-[48px]"
              onClick={() => {
                navigate("/social");
                haptic("tap");
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Meet
            </Button>
          </div>
          <CompassVerifySheet
            open={showCompassVerify}
            onOpenChange={setShowCompassVerify}
            targetUserId={userId}
            targetName={name}
          />
        </motion.div>
      )}

      {isOwnProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            variant="outline"
            className="w-full min-h-[48px]"
            onClick={() => navigate("/settings")}
          >
            Edit Profile
          </Button>
        </motion.div>
      )}
    </div>
  );
}
