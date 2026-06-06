import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TicketStub } from "@/components/retro/TicketStub";
import { StampButton } from "@/components/retro/StampButton";
import { mockTickets } from "@/data/mockTickets";
import { Clock, MapPin, Users } from "lucide-react";

export default function TicketCounter() {
  const [claimed, setClaimed] = useState<Set<string>>(new Set());

  const claim = (id: string) =>
    setClaimed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 sm:p-8 max-w-3xl mx-auto">
      <header className="ink-border bg-[hsl(var(--card))] shadow-stamp p-5 mb-6 text-center">
        <p className="font-mono-retro text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--foreground))]/60">
          Window 03 · Open 24/7
        </p>
        <h1 className="font-extrabold text-3xl sm:text-4xl no-text-shadow">Ticket Counter</h1>
        <p className="font-typewriter text-sm text-[hsl(var(--foreground))]/70 mt-1">
          Tear off your stub. See you there.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        {mockTickets.map((t) => {
          const isClaimed = claimed.has(t.id);
          return (
            <TicketStub key={t.id} className="relative overflow-hidden">
              {/* perforation */}
              <div className="absolute top-2 bottom-2 left-[110px] sm:left-[140px] w-px border-l-2 border-dashed border-[hsl(var(--foreground))]/40 pointer-events-none" />

              <div className="flex">
                {/* date stub */}
                <div className="w-[110px] sm:w-[140px] shrink-0 bg-[hsl(var(--terracotta))] text-[hsl(var(--background))] flex flex-col items-center justify-center py-6">
                  <span className="font-mono-retro text-xs tracking-widest opacity-80">{t.month}</span>
                  <span className="font-extrabold text-5xl sm:text-6xl leading-none no-text-shadow">{t.day}</span>
                  <span className="font-mono-retro text-[10px] mt-1 tracking-widest">{t.time}</span>
                </div>

                {/* body */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono-retro text-[10px] uppercase tracking-widest bg-[hsl(var(--olive))] text-[hsl(var(--background))] px-1.5 py-0.5">
                        {t.category}
                      </span>
                      <h3 className="font-extrabold text-xl sm:text-2xl mt-1.5 leading-tight no-text-shadow">{t.title}</h3>
                    </div>
                    <span className="font-mono-retro text-[10px] text-[hsl(var(--foreground))]/60">#{t.id.toUpperCase()}</span>
                  </div>

                  <div className="font-typewriter text-xs sm:text-sm text-[hsl(var(--foreground))]/75 mt-2 space-y-1">
                    <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {t.venue}, {t.city}</p>
                    <p className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {t.month} {t.day} · {t.time}</p>
                    <p className="flex items-center gap-1.5"><Users className="h-3 w-3" /> hosted by <strong>{t.host}</strong></p>
                  </div>

                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="font-mono-retro text-[10px] uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                      {t.seatsLeft} seats left
                    </span>
                    <div className="relative">
                      <StampButton
                        variant={isClaimed ? "olive" : "amber"}
                        size="sm"
                        disabled={isClaimed}
                        onClick={() => claim(t.id)}
                      >
                        {isClaimed ? "Ticket Claimed" : "RSVP"}
                      </StampButton>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isClaimed && (
                  <motion.div
                    initial={{ scale: 2.5, rotate: -25, opacity: 0 }}
                    animate={{ scale: 1, rotate: -12, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14 }}
                    className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 font-mono-retro font-extrabold tracking-widest text-[hsl(var(--terracotta))] text-2xl sm:text-3xl"
                    style={{ border: "4px double hsl(var(--terracotta))", padding: "6px 14px" }}
                  >
                    CLAIMED
                  </motion.div>
                )}
              </AnimatePresence>
            </TicketStub>
          );
        })}
      </div>
    </div>
  );
}