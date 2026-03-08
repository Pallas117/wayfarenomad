import { motion } from "framer-motion";
import { MapPin, Calendar, DollarSign, Users, CheckCircle, Loader2, XCircle, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import type { Expedition } from "@/hooks/useExpeditions";

interface ExpeditionCardProps {
  expedition: Expedition;
  isHost: boolean;
  onBook: () => void;
  onCancel: () => void;
  onComplete: () => void;
  index: number;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  planning: { label: "Planning", className: "bg-secondary text-secondary-foreground" },
  active: { label: "Active", className: "bg-primary/20 text-primary" },
  completed: { label: "Completed", className: "bg-accent/20 text-accent" },
  cancelled: { label: "Cancelled", className: "bg-destructive/20 text-destructive" },
};

export function ExpeditionCard({ expedition, isHost, onBook, onCancel, onComplete, index }: ExpeditionCardProps) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[expedition.status ?? "planning"] ?? STATUS_CONFIG.planning;
  const hasLocation = expedition.lat && expedition.lng;
  const isCompleted = expedition.status === "completed";
  const isCancelled = expedition.status === "cancelled";
  const canBook = !isHost && !expedition.is_booked && !isCompleted && !isCancelled;
  const canCancel = !isHost && expedition.is_booked && !isCompleted;
  const canComplete = isHost && expedition.status !== "completed" && !isCancelled;

  return (
    <motion.div
      className="glass-card rounded-xl p-4 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, type: "spring", stiffness: 150 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base truncate">{expedition.title}</h3>
          {expedition.location_name && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{expedition.location_name}</span>
            </div>
          )}
        </div>
        <Badge className={`text-[10px] shrink-0 ${status.className}`}>{status.label}</Badge>
      </div>

      {expedition.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{expedition.description}</p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-primary" />
          <span>
            {format(new Date(expedition.start_date), "MMM d")} – {format(new Date(expedition.end_date), "MMM d, yyyy")}
          </span>
        </div>
        {expedition.cost_usd != null && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-primary" />
            <span>${Number(expedition.cost_usd).toFixed(0)}</span>
          </div>
        )}
        {expedition.max_participants != null && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-primary" />
            <span>{expedition.max_participants} spots</span>
          </div>
        )}
      </div>

      {isHost && (
        <Badge variant="outline" className="text-[10px]">You're hosting</Badge>
      )}

      {expedition.is_booked && !isHost && (
        <Badge className="text-[10px] bg-primary/20 text-primary">
          <CheckCircle className="h-3 w-3 mr-1" /> Booked
        </Badge>
      )}

      <div className="flex gap-2 pt-1">
        {canBook && (
          <Button size="sm" className="gradient-gold text-primary-foreground min-h-[36px] flex-1" onClick={onBook}>
            Book +10⭐
          </Button>
        )}
        {canCancel && (
          <Button size="sm" variant="outline" className="min-h-[36px] flex-1" onClick={onCancel}>
            <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
          </Button>
        )}
        {canComplete && (
          <Button size="sm" variant="outline" className="min-h-[36px] border-primary/30 text-primary" onClick={onComplete}>
            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Complete +50⭐
          </Button>
        )}
      </div>
    </motion.div>
  );
}
