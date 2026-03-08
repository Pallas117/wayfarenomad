import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationPicker } from "@/components/LocationPicker";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const RESOURCE_CATEGORIES = [
  { value: "wet_market", label: "🛒 Wet Market" },
  { value: "water", label: "💧 Water Source" },
  { value: "secure_nook", label: "🛡️ Secure Nook" },
];

interface AddResourceFormProps {
  onAdded?: () => void;
}

export function AddResourceForm({ onAdded }: AddResourceFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");

  const handleSubmit = async () => {
    if (!user || !name || !category || !lat || !lng) return;
    setSaving(true);
    const { error } = await supabase.from("functional_points").insert({
      name,
      category,
      description: description || null,
      lat,
      lng,
      city: locationName || "Unknown",
      address: locationName || null,
      created_by: user.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resource added ✓" });
      setOpen(false);
      setName("");
      setCategory("");
      setDescription("");
      setLat(null);
      setLng(null);
      setLocationName("");
      onAdded?.();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-12 w-12 rounded-full gradient-gold shadow-lg">
          <Plus className="h-5 w-5 text-primary-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Add Resource Point</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Name (e.g. Chow Kit Market)" value={name} onChange={(e) => setName(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {RESOURCE_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(newLat, newLng, locName) => { setLat(newLat); setLng(newLng); if (locName) setLocationName(locName); }}
            onClear={() => { setLat(null); setLng(null); setLocationName(""); }}
          />
          <Button onClick={handleSubmit} disabled={saving || !name || !category || !lat} className="w-full gradient-gold text-primary-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add Resource
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
