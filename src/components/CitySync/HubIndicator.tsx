import { motion } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import { useCitySync, REGIONAL_THEMES } from "./CitySyncProvider";
import { useState } from "react";

export function HubIndicator() {
  const { currentHub, currentCity, theme, setHubManually } = useCitySync();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-xs"
        onClick={() => setShowPicker(!showPicker)}
        whileTap={{ scale: 0.95 }}
      >
        <MapPin className="h-3 w-3 text-primary" />
        <span className="font-medium">{currentCity || theme.name.split("—")[0].trim()}</span>
        <span className="text-muted-foreground">{REGIONAL_THEMES[currentHub]?.emoji}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </motion.button>

      {showPicker && (
        <motion.div
          className="absolute top-full mt-2 right-0 glass-card rounded-xl p-2 min-w-[200px] z-50 border border-border shadow-lg"
          initial={{ opacity: 0, y: -5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        >
          {Object.values(REGIONAL_THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setHubManually(t.id);
                setShowPicker(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                currentHub === t.id
                  ? "bg-primary/20 text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <span>{t.emoji}</span>
              <span className="font-medium">{t.name}</span>
              {currentHub === t.id && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
