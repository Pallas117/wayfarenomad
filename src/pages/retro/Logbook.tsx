import { useMemo, useState } from "react";
import { PolaroidAvatar } from "@/components/retro/PolaroidAvatar";
import { TapeLabel } from "@/components/retro/TapeLabel";
import { useCitySync } from "@/components/CitySync";
import { mockNomads } from "@/data/mockNomads";

const FILTERS = ["All", "Active Now", "Recently Arrived"] as const;

export default function Logbook() {
  const { currentCity } = useCitySync();
  const cityName = currentCity?.trim() || "Lisbon";

  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const list = useMemo(() => {
    if (filter === "Active Now") return mockNomads.filter((n) => n.active);
    if (filter === "Recently Arrived") return mockNomads.filter((n) => /day|just/i.test(n.arrived));
    return mockNomads;
  }, [filter]);

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4 sm:p-8">
      <header className="ink-border bg-[hsl(var(--card))] shadow-stamp p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono-retro text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--foreground))]/60">
              The Logbook · Nomad Radar
            </p>
            <h1 className="font-extrabold text-3xl sm:text-4xl no-text-shadow">Who's in town</h1>
          </div>
          <div className="ink-border-thin bg-[hsl(var(--foreground))] text-[hsl(var(--amber))] px-4 py-2 font-mono-retro text-sm">
            <span className="opacity-60 text-[10px] tracking-widest block">CURRENT COORDINATES</span>
            <span className="font-bold tracking-widest">▮ {cityName.toUpperCase()}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f, i) => (
            <TapeLabel key={f} active={filter === f} tilt={i % 2 ? 1.5 : -1.5} onClick={() => setFilter(f)}>
              {f}
            </TapeLabel>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {list.map((n) => (
          <article key={n.id} className="bg-[hsl(var(--card))] ink-border shadow-stamp p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-retro text-[10px] uppercase tracking-widest bg-[hsl(var(--olive))] text-[hsl(var(--background))] px-2 py-0.5">
                ID · {n.handle}
              </span>
              <div className="flex items-center gap-1.5">
                {n.active ? (
                  <>
                    <span className="led-dot" />
                    <span className="font-mono-retro text-[9px] tracking-widest">ACTIVE</span>
                  </>
                ) : (
                  <span className="font-mono-retro text-[9px] tracking-widest text-[hsl(var(--foreground))]/50">IDLE</span>
                )}
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <PolaroidAvatar initials={n.initials} className="w-24 shrink-0 -rotate-2" />
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-lg leading-tight truncate no-text-shadow">{n.name}</h3>
                <p className="font-mono-retro text-[10px] uppercase tracking-wider text-[hsl(var(--foreground))]/70 mb-1">
                  {n.role}
                </p>
                <p className="font-typewriter text-xs text-[hsl(var(--foreground))]/70 mb-2">
                  from <strong>{n.origin}</strong> · {n.arrived}
                </p>
                <p className="font-typewriter text-xs italic">"{n.bio}"</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t-2 border-dashed border-[hsl(var(--foreground))]/30">
              <p className="font-mono-retro text-[9px] uppercase tracking-widest mb-1.5 text-[hsl(var(--foreground))]/60">Stamps</p>
              <div className="flex flex-wrap gap-1">
                {n.stamps.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center justify-center min-w-[34px] h-[26px] px-1 ink-border-thin bg-[hsl(var(--terracotta))]/15 font-mono-retro font-bold text-[10px] tracking-wider text-[hsl(var(--terracotta))] -rotate-3"
                    style={{ border: "2px solid hsl(var(--terracotta))" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}