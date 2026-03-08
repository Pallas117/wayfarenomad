import { useState } from "react";
import { motion } from "framer-motion";
import { X, Coffee, Laptop, PartyPopper, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "@/components/LocationPicker";
import { useAuth } from "@/hooks/useAuth";
import { useCreateHangout } from "@/hooks/useHangouts";
import { useToast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const categories = [
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "coworking", label: "Coworking", icon: Laptop },
  { id: "nightlife", label: "Nightlife", icon: PartyPopper },
  { id: "activity", label: "Activity", icon: Bike },
];

interface CreateHangoutFormProps {
  onClose: () => void;
}

export function CreateHangoutForm({ onClose }: CreateHangoutFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const createHangout = useCreateHangout();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [category, setCategory] = useState("coffee");
  const [dateTime, setDateTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("10");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!user || !title || !dateTime) return;

    try {
      await createHangout.mutateAsync({
        creator_id: user.id,
        title,
        description: description || undefined,
        location_name: locationName || undefined,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        hangout_time: new Date(dateTime).toISOString(),
        max_attendees: parseInt(maxAttendees) || 10,
        category,
      });

      toast({ title: "Hangout Created! 🎉", description: "+5 Stardust earned" });
      haptic("success");
      onClose();
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-card rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Create Hangout</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Category */}
      <div className="flex gap-2">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => { setCategory(c.id); haptic("tap"); }}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors",
                category === c.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{c.label}</span>
            </button>
          );
        })}
      </div>

      <Input
        placeholder="What's the hangout? *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />

      <Input
        placeholder="Location name (e.g. Blue Tokai, Canggu)"
        value={locationName}
        onChange={(e) => setLocationName(e.target.value)}
      />

      <LocationPicker
        lat={lat}
        lng={lng}
        onChange={(newLat, newLng, name) => {
          setLat(newLat);
          setLng(newLng);
          if (name && !locationName) setLocationName(name);
        }}
        onClear={() => {
          setLat(null);
          setLng(null);
          setLocationName("");
        }}
      />

      <div className="flex gap-3">
        <Input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="flex-1"
        />
        <Input
          type="number"
          placeholder="Max"
          value={maxAttendees}
          onChange={(e) => setMaxAttendees(e.target.value)}
          className="w-20"
          min={2}
          max={50}
        />
      </div>

      <Button
        className="w-full gradient-gold text-primary-foreground hover:opacity-90 min-h-[44px]"
        onClick={handleSubmit}
        disabled={!title || !dateTime || createHangout.isPending}
      >
        {createHangout.isPending ? "Creating..." : "Create Hangout ✦"}
      </Button>
    </motion.div>
  );
}
