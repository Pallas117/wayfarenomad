import { useState } from "react";
import { StampButton } from "./StampButton";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: { title: string; body: string; tag: string }) => void;
}

const tags = ["Meetups", "Wifi Spots", "Housing", "General Chaos"];

export function LeaveNoteModal({ open, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("Meetups");

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[hsl(var(--foreground))]/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#fdf6c9] ink-border shadow-stamp-lg p-5"
        style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 26px, hsl(220 30% 40% / 0.18) 26px 27px)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono-retro text-sm uppercase tracking-widest">Leave a Note</h3>
          <button onClick={onClose} className="ink-border-thin p-1 press bg-[hsl(var(--card))]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline…"
          className="w-full bg-transparent border-0 border-b-2 border-dashed border-[hsl(var(--foreground))]/40 px-1 py-1 mb-3 outline-none font-bold text-lg placeholder:text-[hsl(var(--foreground))]/40"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write something for the board…"
          rows={6}
          className="w-full bg-transparent border-0 px-1 py-1 outline-none font-typewriter text-sm resize-none placeholder:text-[hsl(var(--foreground))]/40"
          style={{ lineHeight: "27px" }}
        />
        <div className="flex flex-wrap gap-2 my-3">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`px-2 py-1 text-[10px] tape-label-yellow press ${tag === t ? "ring-2 ring-[hsl(var(--terracotta))]" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <StampButton variant="cream" size="sm" onClick={onClose}>Cancel</StampButton>
          <StampButton
            variant="amber"
            size="sm"
            disabled={!title.trim() || !body.trim()}
            onClick={() => {
              onSubmit({ title: title.trim(), body: body.trim(), tag });
              setTitle(""); setBody("");
            }}
          >
            Pin to Board
          </StampButton>
        </div>
      </div>
    </div>
  );
}