import { useMemo, useState } from "react";
import { TapeLabel } from "@/components/retro/TapeLabel";
import { Pinned } from "@/components/retro/Pinned";
import { StampButton } from "@/components/retro/StampButton";
import { LeaveNoteModal } from "@/components/retro/LeaveNoteModal";
import { mockBoardPosts, type BoardPost } from "@/data/mockBoard";
import { Plus } from "lucide-react";

const TAGS = ["All", "Meetups", "Wifi Spots", "Housing", "General Chaos"] as const;

const colorMap: Record<BoardPost["color"], string> = {
  yellow: "bg-[#fdf6c9]",
  pink: "bg-[#ffd6d6]",
  blue: "bg-[#cce4f7]",
  green: "bg-[#d4e9c5]",
};

export default function BulletinBoard() {
  const [posts, setPosts] = useState<BoardPost[]>(mockBoardPosts);
  const [filter, setFilter] = useState<(typeof TAGS)[number]>("All");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(
    () => (filter === "All" ? posts : posts.filter((p) => p.tag === filter)),
    [posts, filter],
  );

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
        {TAGS.map((t, i) => (
          <TapeLabel
            key={t}
            active={filter === t}
            tilt={i % 2 === 0 ? -2 : 2}
            onClick={() => setFilter(t)}
          >
            {t}
          </TapeLabel>
        ))}
      </div>

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