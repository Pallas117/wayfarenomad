import { useState } from "react";
import { Plus, Loader2, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "wellbeing", "culture", "entertainment", "shopping", "nature",
  "event", "festival", "nightlife", "fitness", "adventure",
  "creative", "singles", "alien",
];

const CITIES = ["Kuala Lumpur", "Singapore", "Krabi"];

interface SubmitEventFormProps {
  onSubmitted: () => void;
}

export function SubmitEventForm({ onSubmitted }: SubmitEventFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("alien");
  const [city, setCity] = useState("Kuala Lumpur");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const resetForm = () => {
    setTitle("");
    setCategory("alien");
    setVenue("");
    setEventDate("");
    setDescription("");
    setSourceUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from("events").insert({
      title: title.trim().slice(0, 200),
      category,
      city,
      venue: venue.trim() || null,
      event_date: eventDate || null,
      description: description.trim().slice(0, 500) || null,
      source_url: sourceUrl.trim() || null,
      submitted_by: user.id,
      is_user_submitted: true,
      verified: false,
      scraped_from: null,
    } as any);

    if (error) {
      toast({ title: "Submit Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event Submitted! 🎉", description: "Your event is live on Pulse." });
      resetForm();
      setOpen(false);
      onSubmitted();
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-12 w-12 rounded-full gradient-gold shadow-lg">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Skull className="h-5 w-5 text-primary" />
            Submit an Event
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="evt-title">Title *</Label>
            <Input
              id="evt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Underground sound bath at midnight..."
              maxLength={200}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c === "alien" ? "👽 Alien" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evt-venue">Venue</Label>
            <Input
              id="evt-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Rooftop at Jalan Sultan..."
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evt-date">Date</Label>
            <Input
              id="evt-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evt-desc">Description</Label>
            <Textarea
              id="evt-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this unmissable?"
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="evt-url">Link (optional)</Label>
            <Input
              id="evt-url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <Button type="submit" className="w-full gradient-gold" disabled={submitting || !title.trim()}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Event
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
