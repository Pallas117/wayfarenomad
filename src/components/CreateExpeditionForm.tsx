import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreateExpeditionFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    location_name?: string;
    start_date: string;
    end_date: string;
    cost_usd?: number;
    max_participants?: number;
  }) => Promise<any>;
  onClose: () => void;
  visible: boolean;
}

export function CreateExpeditionForm({ onSubmit, onClose, visible }: CreateExpeditionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cost, setCost] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;
    setSubmitting(true);
    await onSubmit({
      title,
      description: description || undefined,
      location_name: location || undefined,
      start_date: startDate,
      end_date: endDate,
      cost_usd: cost ? parseFloat(cost) : undefined,
      max_participants: maxParticipants ? parseInt(maxParticipants) : undefined,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            className="glass-card rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">Host Expedition</h2>
              <Button variant="ghost" size="icon" onClick={onClose} type="button">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-title">Title *</Label>
              <Input id="exp-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bali Surf & Code Retreat" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-desc">Description</Label>
              <Textarea id="exp-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes this expedition special?" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-loc" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Location
              </Label>
              <Input id="exp-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Canggu, Bali" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="exp-start" className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Start *
                </Label>
                <Input id="exp-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-end" className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> End *
                </Label>
                <Input id="exp-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="exp-cost" className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Cost (USD)
                </Label>
                <Input id="exp-cost" type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-max" className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Max spots
                </Label>
                <Input id="exp-max" type="number" min="1" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="10" />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-gold text-primary-foreground min-h-[44px]" disabled={submitting || !title || !startDate || !endDate}>
              {submitting ? "Creating..." : "Launch Expedition ✨"}
            </Button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
