import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Vibrate, Volume2, VolumeX, Shield, Info, MapPin, RotateCw, Bell, BellOff, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SocialProfileLinks } from "@/components/SocialProfileLinks";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { AvatarUpload } from "@/components/AvatarUpload";
import { supabase } from "@/integrations/supabase/client";
import {
  haptic,
  getVibrationIntensity,
  setVibrationIntensity,
  isHapticsAvailable,
} from "@/lib/haptics";
import { useCitySync, REGIONAL_THEMES } from "@/components/CitySync";

const HAPTIC_DEMOS: { name: string; pattern: Parameters<typeof haptic>[0]; label: string }[] = [
  { name: "Success", pattern: "success", label: "Double tap" },
  { name: "Beacon Match", pattern: "beaconMatch", label: "Heartbeat" },
  { name: "SOS Alert", pattern: "sosAlert", label: "Heavy buzz" },
  { name: "Message", pattern: "messageReceived", label: "Single thud" },
  { name: "Music ID", pattern: "musicIdentified", label: "Ascending" },
  { name: "Stardust", pattern: "stardust", label: "Sparkle" },
  { name: "Shimmer", pattern: "shimmer", label: "Micro-vibes" },
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [intensity, setIntensity] = useState(getVibrationIntensity());
  const hapticsSupported = isHapticsAvailable();
  const citySyncCtx = useCitySync();
  const push = usePushNotifications();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Traveler");
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("avatar_url, display_name, full_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url);
          setDisplayName(data.display_name || data.full_name || "Traveler");
          setNameInput(data.display_name || data.full_name || "");
        }
      });
  }, [user]);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2 || !user) return;
    if (trimmed.length > 50) {
      toast({ title: "Too long", description: "Display name must be under 50 characters.", variant: "destructive" });
      return;
    }
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("user_id", user.id);
    setSavingName(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDisplayName(trimmed);
      haptic("success");
      toast({ title: "Name updated ✦" });
    }
  };

  const handleIntensityChange = (value: number[]) => {
    const v = value[0];
    setIntensity(v);
    setVibrationIntensity(v);
    haptic("tap");
  };

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-display font-bold">Settings</h1>
      </motion.div>

      {/* Avatar Upload */}
      <motion.div
        className="glass-card rounded-xl p-5 mb-6 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <AvatarUpload
          currentUrl={avatarUrl}
          displayName={displayName}
          onUploaded={(url) => setAvatarUrl(url)}
        />
        <p className="text-xs text-muted-foreground">Tap to change your photo</p>
      </motion.div>

      {/* Social Profile Links */}
      <div className="mb-6">
        <SocialProfileLinks />
      </div>

      {/* Haptic Identity Section */}
      <motion.div
        className="glass-card rounded-xl p-5 mb-6 space-y-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <Vibrate className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Tactile Language</h2>
          {!hapticsSupported && (
            <Badge variant="secondary" className="text-xs">Not supported</Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Adjust vibration strength for haptic feedback. All sound cues are replaced with tactile patterns.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Vibration Strength</span>
            <div className="flex items-center gap-2">
              {intensity > 0 ? (
                <Volume2 className="h-4 w-4 text-primary" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground w-10 text-right">
                {Math.round(intensity * 100)}%
              </span>
            </div>
          </div>
          <Slider
            value={[intensity]}
            onValueChange={handleIntensityChange}
            min={0}
            max={1}
            step={0.05}
            disabled={!hapticsSupported}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Off</span>
            <span>Subtle</span>
            <span>Full</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-3">Tap to preview each pattern:</p>
          <div className="grid grid-cols-2 gap-2">
            {HAPTIC_DEMOS.map((demo) => (
              <Button
                key={demo.name}
                variant="outline"
                size="sm"
                className="min-h-[44px] text-xs justify-start"
                onClick={() => haptic(demo.pattern)}
                disabled={!hapticsSupported || intensity <= 0}
              >
                <span className="font-medium mr-1">{demo.name}</span>
                <span className="text-muted-foreground">({demo.label})</span>
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* City-Sync Hub Section */}
      <motion.div
        className="glass-card rounded-xl p-5 mb-6 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Regional Hub</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={() => citySyncCtx.rescan()} className="h-8 w-8 p-0">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {citySyncCtx.currentCity
            ? `Detected: ${citySyncCtx.currentCity}`
            : "Select your hub to change the celestial theme"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(REGIONAL_THEMES).map((t) => (
            <Button
              key={t.id}
              variant="outline"
              size="sm"
              className={`min-h-[44px] text-xs justify-start gap-2 ${
                citySyncCtx.currentHub === t.id ? "border-primary bg-primary/10" : ""
              }`}
              onClick={() => citySyncCtx.setHubManually(t.id)}
            >
              <span>{t.emoji}</span>
              <span className="truncate">{t.name.split("—")[1]?.trim() || t.name}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Push Notifications Section */}
      <motion.div
        className="glass-card rounded-xl p-5 mb-6 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <div className="flex items-center gap-3">
          {push.isSubscribed ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <h2 className="font-display font-semibold text-lg">Push Notifications</h2>
          {!push.isSupported && (
            <Badge variant="secondary" className="text-xs">Not supported</Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Get notified when you receive new encrypted messages, even when the app is closed.
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Message Notifications</p>
            <p className="text-xs text-muted-foreground">
              {push.isSubscribed ? "You'll receive push alerts" : "Enable to get message alerts"}
            </p>
          </div>
          <Switch
            checked={push.isSubscribed}
            onCheckedChange={(checked) => {
              if (checked) push.subscribe();
              else push.unsubscribe();
            }}
            disabled={!push.isSupported || push.loading}
          />
        </div>
      </motion.div>

      {/* Privacy Section */}
      <motion.div
        className="glass-card rounded-xl p-5 mb-6 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Privacy</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Cultural Ear Microphone</p>
            <p className="text-xs text-muted-foreground">Allow music identification</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Share Music Vibes</p>
            <p className="text-xs text-muted-foreground">Let nearby nomads see your identified tracks</p>
          </div>
          <Switch defaultChecked />
        </div>
      </motion.div>

      {/* Account */}
      <motion.div
        className="glass-card rounded-xl p-5 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Account</h2>
        </div>

        {user && (
          <p className="text-sm text-muted-foreground">{user.email}</p>
        )}

        <Button
          variant="outline"
          className="w-full min-h-[44px]"
          onClick={signOut}
        >
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
}
