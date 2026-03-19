import { motion } from "framer-motion";
import { MapPin, Calendar, BookOpen, GraduationCap } from "lucide-react";
import { format } from "date-fns";

export interface ItineraryCardData {
  city: string;
  arrivalDate: string;
  departureDate: string;
  teaches?: string[];
  learns?: string[];
}

/** Prefix used to detect itinerary messages in chat */
export const ITINERARY_PREFIX = "::itinerary::";

export function encodeItineraryMessage(data: ItineraryCardData): string {
  return ITINERARY_PREFIX + JSON.stringify(data);
}

export function decodeItineraryMessage(content: string): ItineraryCardData | null {
  if (!content.startsWith(ITINERARY_PREFIX)) return null;
  try {
    return JSON.parse(content.slice(ITINERARY_PREFIX.length));
  } catch {
    return null;
  }
}

export function ItineraryShareCard({ data, isMine }: { data: ItineraryCardData; isMine: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`max-w-[85%] rounded-2xl overflow-hidden ${
        isMine ? "rounded-br-md" : "rounded-bl-md"
      }`}
    >
      <div className={`p-3 ${isMine ? "gradient-gold" : "bg-secondary/60"}`}>
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className={`h-3.5 w-3.5 ${isMine ? "text-primary-foreground" : "text-primary"}`} />
          <span className={`font-display font-bold text-sm ${isMine ? "text-primary-foreground" : "text-foreground"}`}>
            {data.city}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs mb-2 ${isMine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          <Calendar className="h-3 w-3" />
          <span>
            {format(new Date(data.arrivalDate), "MMM d")} → {format(new Date(data.departureDate), "MMM d, yyyy")}
          </span>
        </div>
        {(data.teaches?.length || data.learns?.length) ? (
          <div className="space-y-1.5">
            {data.teaches && data.teaches.length > 0 && (
              <div className={`flex items-start gap-1 text-[10px] ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                <BookOpen className="h-3 w-3 mt-0.5 shrink-0" />
                <span>Teaches: {data.teaches.join(", ")}</span>
              </div>
            )}
            {data.learns && data.learns.length > 0 && (
              <div className={`flex items-start gap-1 text-[10px] ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                <GraduationCap className="h-3 w-3 mt-0.5 shrink-0" />
                <span>Learns: {data.learns.join(", ")}</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
