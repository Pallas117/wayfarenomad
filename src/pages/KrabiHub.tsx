import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KrabiSplash, hasSeenKrabiOnboarding } from "@/components/KrabiSplash";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { 
  Calendar, MapPin, Users, Droplets, Coffee, Route, 
  PartyPopper, CheckCircle2, Loader2, MessageSquarePlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { NomadDebriefModal } from "@/components/NomadDebriefModal";
import "leaflet/dist/leaflet.css";

// Krabi coordinates
const KRABI_CENTER: [number, number] = [8.0863, 98.9063];

// Static pins for Krabi Songkran
const KRABI_PINS = [
  {
    id: "meetup",
    name: "Songkran Meetup Point",
    description: "Main gathering spot for Wayfare nomads. Join us for water fights and good vibes!",
    lat: 8.0592,
    lng: 98.9186,
    icon: "🎉",
    category: "meetup"
  },
  {
    id: "cowork",
    name: "No-Water Co-working Zone",
    description: "Dry zone with AC, WiFi, and cold drinks. Perfect for getting work done during Songkran.",
    lat: 8.0863,
    lng: 98.9063,
    icon: "☕",
    category: "cowork"
  },
  {
    id: "safe-route",
    name: "Safe Dry Route",
    description: "Back-alley route to stay dry while navigating town. Use after noon for best results.",
    lat: 8.0722,
    lng: 98.9144,
    icon: "🛤️",
    category: "route"
  }
];

const EVENT_NAME = "wayfare-songkran-2024";

export default function KrabiHub() {
  const { user } = useAuth();
  const [hasRsvp, setHasRsvp] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [checkingRsvp, setCheckingRsvp] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !hasSeenKrabiOnboarding());

  useEffect(() => {
    if (!user) {
      setCheckingRsvp(false);
      return;
    }
    
    const checkRsvp = async () => {
      const { data } = await supabase
        .from("rsvps")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_name", EVENT_NAME)
        .maybeSingle();
      
      setHasRsvp(!!data);
      setCheckingRsvp(false);
    };
    
    checkRsvp();
  }, [user]);

  const handleRsvp = async () => {
    if (!user) {
      toast.error("Please sign in to RSVP");
      return;
    }
    
    setRsvpLoading(true);
    haptic("tap");
    
    try {
      if (hasRsvp) {
        await supabase
          .from("rsvps")
          .delete()
          .eq("user_id", user.id)
          .eq("event_name", EVENT_NAME);
        
        setHasRsvp(false);
        toast.success("RSVP cancelled");
      } else {
        await supabase
          .from("rsvps")
          .insert({ user_id: user.id, event_name: EVENT_NAME, status: "attending" });
        
        setHasRsvp(true);
        haptic("success");
        toast.success("You're in! See you at Songkran 💦");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setRsvpLoading(false);
    }
  };

  // Create custom icon
  const createIcon = (emoji: string) => new Icon({
    iconUrl: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><text y='32' font-size='32'>${emoji}</text></svg>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35]
  });

  return (
    <>
      <AnimatePresence>
        {showSplash && <KrabiSplash onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
    <div className="min-h-screen pb-24 krabi-theme">
      {/* Hero Banner */}
      <motion.div
        className="relative overflow-hidden rounded-b-3xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="krabi-gradient px-6 pt-8 pb-12">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="h-6 w-6 text-white" />
            <Badge className="bg-white/20 text-white border-white/30">
              Songkran 2024
            </Badge>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Krabi Hub
          </h1>
          <p className="text-white/80 text-sm">
            Your guide to surviving—and thriving—during Thailand's wildest water festival
          </p>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Event RSVP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="krabi-card overflow-hidden">
            <CardContent className="p-0">
              <div className="krabi-gradient-subtle p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <PartyPopper className="h-5 w-5 text-krabi-coral" />
                      <h3 className="font-display font-semibold text-lg">
                        Wayfare Sunset Meetup
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Join fellow nomads for drinks, music, and networking at sunset. Dry clothes only!
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        April 13, 2024 • 5:00 PM
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        Ao Nang Beach
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Open to all Wayfarers
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  className={`mt-4 w-full min-h-[48px] ${
                    hasRsvp 
                      ? "bg-krabi-teal hover:bg-krabi-teal/90" 
                      : "krabi-button-gradient"
                  }`}
                  onClick={handleRsvp}
                  disabled={rsvpLoading || checkingRsvp}
                >
                  {rsvpLoading || checkingRsvp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : hasRsvp ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      You're Going! (Tap to cancel)
                    </>
                  ) : (
                    "RSVP — I'll Be There! 💦"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-krabi-coral" />
            Krabi Survival Map
          </h2>
          <div className="rounded-xl overflow-hidden border border-border h-[300px]">
            <MapContainer
              center={KRABI_CENTER}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {KRABI_PINS.map((pin) => (
                <Marker
                  key={pin.id}
                  position={[pin.lat, pin.lng]}
                  icon={createIcon(pin.icon)}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold text-sm mb-1">{pin.name}</h4>
                      <p className="text-xs text-gray-600">{pin.description}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="krabi-card">
            <CardContent className="p-4 text-center">
              <PartyPopper className="h-6 w-6 text-krabi-coral mx-auto mb-2" />
              <p className="text-xs font-medium">Meetup Point</p>
            </CardContent>
          </Card>
          <Card className="krabi-card">
            <CardContent className="p-4 text-center">
              <Coffee className="h-6 w-6 text-krabi-teal mx-auto mb-2" />
              <p className="text-xs font-medium">Dry Cowork</p>
            </CardContent>
          </Card>
          <Card className="krabi-card">
            <CardContent className="p-4 text-center">
              <Route className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium">Safe Route</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feedback Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            className="w-full min-h-[48px] border-krabi-teal text-krabi-teal hover:bg-krabi-teal/10"
            onClick={() => {
              haptic("tap");
              setShowFeedback(true);
            }}
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Nomad Debrief — Give Feedback
          </Button>
        </motion.div>
      </div>

      <NomadDebriefModal open={showFeedback} onOpenChange={setShowFeedback} />
    </div>
    </>
  );
}
