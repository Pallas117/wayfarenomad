import { useMemo, useState } from "react";
import { TapeLabel } from "@/components/retro/TapeLabel";
import { Pinned } from "@/components/retro/Pinned";
import { StampButton } from "@/components/retro/StampButton";
import { LeaveNoteModal } from "@/components/retro/LeaveNoteModal";
import { mockBoardPosts, type BoardPost } from "@/data/mockBoard";
import { Plus, X, Search } from "lucide-react";

const TAGS = ["Meetups", "Wifi Spots", "Housing", "General Chaos"] as const;
type Tag = (typeof TAGS)[number];

const colorMap: Record<BoardPost["color"], string> = {
  yellow: "bg-[#fdf6c9]",
  pink: "bg-[#ffd6d6]",
  blue: "bg-[#cce4f7]",
  green: "bg-[#d4e9c5]",
};

export default function BulletinBoard() {
  const [posts, setPosts] = useState<BoardPost[]>(mockBoardPosts);
  const [active, setActive] = useState<Set<Tag>>(new Set());
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of posts) c[p.tag] = (c[p.tag] || 0) + 1;
    return c;
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (active.size > 0 && !active.has(p.tag as Tag)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
      );
    });
  }, [posts, active, query]);

  const toggle = (t: Tag) => {
    setActive((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  return (
    <div className="corkboard min-h-[calc(100vh-8rem)] p-4 sm:p-8 relative">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono-retro text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--background))]/80">
            WAYFARE · Community Board · No. 042
          </p>
          <h1 className="font-extrabold text-3xl sm:text-4xl text-[hsl(var(--background))] no-text-shadow">
            The Bulletin Board
          </h1>
        </div>
        <div className="font-mono-retro text-[10px] text-[hsl(var(--background))]/80 bg-[hsl(var(--foreground))]/30 px-2 py-1 ink-border-thin">
          {filtered.length} NOTES PINNED
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <div className="relative flex items-center w-full sm:w-72 mr-auto">
          <Search className="absolute left-2 h-3.5 w-3.5 text-[hsl(var(--foreground))]/60" strokeWidth={3} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH NOTES…"
            className="w-full pl-7 pr-7 py-1.5 bg-[hsl(var(--background))] ink-border-thin font-mono-retro text-xs uppercase tracking-wider placeholder:text-[hsl(var(--foreground))]/40 focus:outline-none focus:shadow-stamp"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 text-[hsl(var(--foreground))]/60 hover:text-[hsl(var(--foreground))]"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" strokeWidth={3} />
            </button>
          )}
        </div>
        {TAGS.map((t, i) => (
          <TapeLabel
            key={t}
            active={active.has(t)}
            tilt={i % 2 === 0 ? -2 : 2}
            onClick={() => toggle(t)}
          >
            {t} <span className="ml-1 opacity-60">{counts[t] || 0}</span>
          </TapeLabel>
        ))}
        {active.size > 0 && (
          <button
            onClick={() => setActive(new Set())}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono-retro uppercase tracking-wider ink-border-thin bg-[hsl(var(--background))] press"
          >
            <X className="h-3 w-3" strokeWidth={3} /> Clear
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="ink-border-thin bg-[hsl(var(--background))]/90 p-6 text-center font-mono-retro text-xs uppercase tracking-widest text-[hsl(var(--foreground))]/70">
          No notes match these filters.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <article
            key={p.id}
            style={{ transform: `rotate(${p.tilt}deg)` }}
            className={`${colorMap[p.color]} ink-border shadow-stamp p-4 pt-7 relative transition-transform hover:scale-[1.02] hover:rotate-0`}
          >
            <div className="absolute left-1/2 -top-2 -translate-x-1/2">
              <Pinned />
            </div>
            <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] tape-label-yellow">{p.tag}</span>
            <h3 className="font-extrabold text-lg leading-tight mb-2 no-text-shadow text-[hsl(var(--foreground))]">
              {p.title}
            </h3>
            <p className="font-typewriter text-sm text-[hsl(var(--foreground))]/85 mb-3">{p.body}</p>
            <p className="font-mono-retro text-[10px] uppercase tracking-wider text-[hsl(var(--foreground))]/60">
              ✦ {p.author}
            </p>
          </article>
        ))}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[hsl(var(--amber))] ink-border shadow-stamp-lg press font-mono-retro font-bold uppercase tracking-wider text-sm no-text-shadow"
      >
        <Plus className="h-4 w-4" strokeWidth={3} />
        Leave a Note
      </button>

      <LeaveNoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(n) => {
          setPosts((prev) => [
            {
              id: String(Date.now()),
              title: n.title,
              body: n.body,
              author: "You",
              tag: n.tag as BoardPost["tag"],
              color: (["yellow", "pink", "blue", "green"] as const)[Math.floor(Math.random() * 4)],
              tilt: Math.random() * 5 - 2.5,
            },
            ...prev,
          ]);
          setModalOpen(false);
        }}
      />
    </div>
  );
}