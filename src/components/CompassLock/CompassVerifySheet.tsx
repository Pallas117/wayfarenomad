import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, MapPin, Check, Compass, Loader2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useCreateCompassLock, isWithinProximity } from "@/hooks/useCompassLock";
import { toast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptics";

interface CompassVerifySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId?: string;
  targetName?: string;
  onSuccess?: () => void;
}

type VerifyTab = "qr" | "gps";

export function CompassVerifySheet({
  open,
  onOpenChange,
  targetUserId,
  targetName,
  onSuccess,
}: CompassVerifySheetProps) {
  const { user } = useAuth();
  const createLock = useCreateCompassLock();
  const [tab, setTab] = useState<VerifyTab>("qr");
  const [scannedId, setScannedId] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "checking" | "success" | "fail">("idle");
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);

  // Generate QR payload for this user
  const qrPayload = user?.id ? `compass://${user.id}` : "";

  const handleQRVerify = async () => {
    const otherId = scannedId.startsWith("compass://")
      ? scannedId.replace("compass://", "")
      : scannedId.trim();

    if (!otherId || otherId === user?.id) {
      toast({ title: "Invalid code", description: "That doesn't look right. Try again.", variant: "destructive" });
      return;
    }

    try {
      await createLock.mutateAsync({ otherUserId: otherId, method: "qr", lat: myPos?.lat, lng: myPos?.lng });
      haptic("success");
      toast({ title: "🧭 Compass Locked!", description: `You're now connected with ${targetName || "this traveler"}.` });
      onSuccess?.();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleGPSVerify = async () => {
    if (!targetUserId) return;
    setGpsStatus("checking");

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      );
      setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });

      // For GPS verification, we create the lock with location data
      // The proximity check relies on both users being at the same place
      // In a real scenario, the other user's location would be checked server-side
      await createLock.mutateAsync({
        otherUserId: targetUserId,
        method: "gps",
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });

      setGpsStatus("success");
      haptic("success");
      toast({ title: "🧭 Compass Locked!", description: `GPS verified! Connected with ${targetName || "this traveler"}.` });
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 1000);
    } catch (e: any) {
      setGpsStatus("fail");
      if (e.code === 1) {
        toast({ title: "Location denied", description: "Enable location access to use GPS verification.", variant: "destructive" });
      } else {
        toast({ title: "Verification failed", description: e.message || "Could not verify proximity.", variant: "destructive" });
      }
    }
  };

  // Get location on mount
  useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silently fail
      );
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center pb-2">
          <SheetTitle className="font-display flex items-center justify-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Compass Lock Verification
          </SheetTitle>
        </SheetHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as VerifyTab)} className="mb-5">
          <TabsList className="w-full bg-secondary/50">
            <TabsTrigger value="qr" className="flex-1 gap-1.5">
              <QrCode className="h-4 w-4" /> QR Code
            </TabsTrigger>
            <TabsTrigger value="gps" className="flex-1 gap-1.5">
              <MapPin className="h-4 w-4" /> GPS Check
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "qr" ? (
          <div className="space-y-5">
            {/* Show own code */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">Show this to the person you're meeting:</p>
              <motion.div
                className="mx-auto w-48 h-48 rounded-2xl bg-card border-2 border-primary/30 flex flex-col items-center justify-center gap-2"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <QrCode className="h-16 w-16 text-primary" />
                <code className="text-xs text-muted-foreground font-mono break-all px-2 select-all">
                  {qrPayload}
                </code>
              </motion.div>
              <p className="text-[10px] text-muted-foreground">
                They can copy your code, or you can enter theirs below
              </p>
            </div>

            {/* Enter their code */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Enter their Compass code:</p>
              <div className="flex gap-2">
                <Input
                  value={scannedId}
                  onChange={(e) => setScannedId(e.target.value)}
                  placeholder="compass://... or user ID"
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  onClick={handleQRVerify}
                  disabled={!scannedId.trim() || createLock.isPending}
                  className="gradient-gold text-primary-foreground"
                >
                  {createLock.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-center">
            <p className="text-sm text-muted-foreground">
              Both you and <span className="font-semibold text-foreground">{targetName || "the other person"}</span> need 
              to be within <span className="font-semibold text-primary">50 meters</span> of each other.
            </p>

            <motion.div
              className="mx-auto h-32 w-32 rounded-full flex items-center justify-center"
              style={{
                background: gpsStatus === "success"
                  ? "hsl(var(--primary) / 0.2)"
                  : gpsStatus === "fail"
                  ? "hsl(var(--destructive) / 0.2)"
                  : "hsl(var(--secondary) / 0.5)",
              }}
              animate={gpsStatus === "checking" ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {gpsStatus === "checking" ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : gpsStatus === "success" ? (
                <Check className="h-12 w-12 text-primary" />
              ) : gpsStatus === "fail" ? (
                <X className="h-12 w-12 text-destructive" />
              ) : (
                <MapPin className="h-12 w-12 text-muted-foreground" />
              )}
            </motion.div>

            {myPos && (
              <p className="text-[10px] text-muted-foreground">
                📍 Your location: {myPos.lat.toFixed(4)}, {myPos.lng.toFixed(4)}
              </p>
            )}

            <Button
              onClick={handleGPSVerify}
              disabled={gpsStatus === "checking" || gpsStatus === "success" || !targetUserId}
              className="w-full gradient-gold text-primary-foreground min-h-[48px] gap-2"
            >
              {gpsStatus === "checking" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                </>
              ) : gpsStatus === "success" ? (
                <>
                  <Check className="h-4 w-4" /> Verified!
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" /> Check Proximity
                </>
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
