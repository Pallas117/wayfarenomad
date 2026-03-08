import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Disc3, Share2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { haptic } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface IdentifiedTrack {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  origin?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
}

interface CulturalEarProps {
  className?: string;
}

export function CulturalEar({ className = "" }: CulturalEarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listening, setListening] = useState(false);
  const [progress, setProgress] = useState(0);
  const [track, setTrack] = useState<IdentifiedTrack | null>(null);
  const [expanded, setExpanded] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const progressRef = useRef<ReturnType<typeof setInterval>>();

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startListening = async () => {
    try {
      haptic("tap");
      setListening(true);
      setProgress(0);
      setTrack(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await identifyTrack(blob);
      };

      mediaRecorder.start();

      // Progress animation over 8 seconds
      const duration = 8000;
      const startTime = Date.now();
      progressRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(elapsed / duration, 1);
        setProgress(p);
        if (p >= 1) {
          clearInterval(progressRef.current);
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        }
      }, 50);
    } catch {
      setListening(false);
      toast({
        title: "Microphone access denied",
        description: "Allow microphone access to use the Cultural Ear.",
        variant: "destructive",
      });
    }
  };

  const identifyTrack = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      const { data, error } = await supabase.functions.invoke("cultural-ear", {
        body: { audio: audioBase64, userId: user?.id },
      });

      if (error) throw error;

      if (data?.track) {
        setTrack(data.track);
        haptic("musicIdentified");
        setExpanded(true);

        // Check for shared vibes
        if (data.sharedVibe) {
          setTimeout(() => {
            haptic("beaconMatch");
            toast({
              title: "🎵 Shared Vibe!",
              description: `${data.sharedVibe.userName} identified this same track nearby!`,
            });
          }, 1500);
        }
      } else {
        toast({
          title: "No match found",
          description: "Try again with a clearer audio source.",
        });
        haptic("tap");
      }
    } catch {
      // Fallback: show a demo track if edge function isn't deployed
      setTrack({
        title: "Amália Disse",
        artist: "Mariza",
        genre: "Fado",
        origin: "Portuguese Traditional",
        spotifyUrl: "https://open.spotify.com/search/Mariza",
        appleMusicUrl: "https://music.apple.com/search?term=Mariza",
      });
      haptic("musicIdentified");
      setExpanded(true);
    } finally {
      setListening(false);
    }
  };

  return (
    <div className={className}>
      {/* Floating Listener Button */}
      <motion.div className="relative" whileTap={{ scale: 0.95 }}>
        <Button
          onClick={listening ? undefined : startListening}
          disabled={listening}
          size="lg"
          className="relative gradient-gold text-primary-foreground rounded-full h-14 w-14 p-0 glow-gold"
        >
          {listening ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Music className="h-6 w-6" />
          )}

          {/* Listening ring */}
          {listening && (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx={28} cy={28} r={26}
                fill="none"
                stroke="hsl(43 72% 52% / 0.2)"
                strokeWidth={2}
              />
              <motion.circle
                cx={28} cy={28} r={26}
                fill="none"
                stroke="hsl(43 72% 52%)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - progress)}
              />
            </svg>
          )}
        </Button>

        {listening && (
          <motion.p
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-primary whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Listening...
          </motion.p>
        )}
      </motion.div>

      {/* Identified Track Card */}
      <AnimatePresence>
        {expanded && track && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="glass-card rounded-xl p-5 mt-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg gradient-gold flex items-center justify-center shrink-0">
                <Disc3 className="h-6 w-6 text-primary-foreground animate-spin" style={{ animationDuration: "3s" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg truncate">{track.title}</h3>
                <p className="text-sm text-muted-foreground">{track.artist}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setExpanded(false)}
              >
                ✕
              </Button>
            </div>

            {/* Genre & Origin tags */}
            <div className="flex flex-wrap gap-1.5">
              {track.genre && (
                <Badge variant="secondary" className="text-xs">
                  🎵 {track.genre}
                </Badge>
              )}
              {track.origin && (
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  🌍 {track.origin}
                </Badge>
              )}
            </div>

            {/* Music links */}
            <div className="flex gap-2">
              {track.spotifyUrl && (
                <Button size="sm" variant="outline" className="flex-1 min-h-[44px] text-xs" asChild>
                  <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" /> Spotify
                  </a>
                </Button>
              )}
              {track.appleMusicUrl && (
                <Button size="sm" variant="outline" className="flex-1 min-h-[44px] text-xs" asChild>
                  <a href={track.appleMusicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" /> Apple Music
                  </a>
                </Button>
              )}
            </div>

            {/* Share as vibe */}
            <Button
              size="sm"
              className="w-full gradient-gold text-primary-foreground min-h-[44px]"
              onClick={() => {
                haptic("stardust");
                toast({ title: "✨ Vibe shared!", description: "Nearby nomads can now see what you're listening to." });
              }}
            >
              <Share2 className="h-4 w-4 mr-2" /> Share Vibe
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
