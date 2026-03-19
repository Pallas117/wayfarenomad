import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LumaCalendarEmbedProps {
  defaultUrl?: string;
}

const DEFAULT_LUMA_URL = "https://lu.ma/embed/calendar/cal-xxxxxxxxxx/events";

export function LumaCalendarEmbed({ defaultUrl }: LumaCalendarEmbedProps) {
  const [lumaUrl, setLumaUrl] = useState(() => {
    return localStorage.getItem("wayfare_luma_url") || defaultUrl || "";
  });
  const [inputUrl, setInputUrl] = useState(lumaUrl);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(!lumaUrl);

  const handleSave = () => {
    // Accept lu.ma/embed or lu.ma/calendar URLs and normalize
    let url = inputUrl.trim();
    if (url && !url.startsWith("http")) url = `https://${url}`;
    // Convert lu.ma/calendar/xxx to embed format
    if (url.includes("lu.ma/") && !url.includes("/embed/")) {
      const match = url.match(/lu\.ma\/(?:calendar\/)?([a-zA-Z0-9-]+)/);
      if (match) {
        url = `https://lu.ma/embed/calendar/${match[1]}/events`;
      }
    }
    setLumaUrl(url);
    localStorage.setItem("wayfare_luma_url", url);
    setEditing(false);
    setLoading(true);
  };

  if (editing || !lumaUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">Connect Luma Calendar</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste your Luma calendar URL to embed events directly in Pulse.
        </p>
        <div className="flex gap-2">
          <Input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://lu.ma/your-calendar"
            className="flex-1 text-xs"
          />
          <Button size="sm" onClick={handleSave} disabled={!inputUrl.trim()}>
            Save
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-display font-semibold">Luma Events</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] px-1.5"
            onClick={() => window.open(lumaUrl.replace("/embed/", "/"), "_blank")}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] px-1.5"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        </div>
      </div>
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      <iframe
        src={lumaUrl}
        className={`w-full border-0 ${loading ? "h-0" : "h-[400px]"}`}
        style={{ colorScheme: "normal" }}
        onLoad={() => setLoading(false)}
        allow="payment"
      />
    </motion.div>
  );
}
