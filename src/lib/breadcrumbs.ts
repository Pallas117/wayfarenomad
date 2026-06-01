// Lightweight in-memory breadcrumb trail for crash diagnostics.
// Records the last N route changes and UI section mounts so the
// ErrorBoundary can show what the user was looking at when it broke.

export type Breadcrumb = {
  ts: number;
  kind: "route" | "section" | "event";
  label: string;
};

const MAX = 20;
/** Breadcrumbs older than this window are dropped on read/load. */
const TTL_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = "lovable.breadcrumbs.v1";
const CHANNEL_NAME = "lovable.breadcrumbs.v1";

type SyncMessage =
  | { type: "push"; crumb: Breadcrumb }
  | { type: "clear" }
  | { type: "replace"; trail: Breadcrumb[] };

const channel: BroadcastChannel | null =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;

function isFresh(b: Breadcrumb, now = Date.now()): boolean {
  return now - b.ts <= TTL_MS;
}

/** Drop expired entries in-place. Returns true if anything changed. */
function pruneExpired(): boolean {
  const now = Date.now();
  let removed = 0;
  while (trail.length && !isFresh(trail[0], now)) {
    trail.shift();
    removed++;
  }
  if (removed > 0) save();
  return removed > 0;
}

function load(): Breadcrumb[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Breadcrumb[];
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter((b) => b && typeof b.ts === "number" && isFresh(b, now)).slice(-MAX);
  } catch {
    return [];
  }
}

function save() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trail));
  } catch {
    // quota or disabled storage — ignore
  }
}

const trail: Breadcrumb[] = load();
const listeners = new Set<() => void>();

function applyPush(crumb: Breadcrumb) {
  const last = trail[trail.length - 1];
  if (last && last.kind === crumb.kind && last.label === crumb.label && last.ts === crumb.ts) return;
  trail.push(crumb);
  if (trail.length > MAX) trail.shift();
  save();
  listeners.forEach((l) => l());
}

export function pushBreadcrumb(kind: Breadcrumb["kind"], label: string) {
  pruneExpired();
  const last = trail[trail.length - 1];
  if (last && last.kind === kind && last.label === label) return;
  const crumb: Breadcrumb = { ts: Date.now(), kind, label };
  trail.push(crumb);
  if (trail.length > MAX) trail.shift();
  save();
  listeners.forEach((l) => l());
  channel?.postMessage({ type: "push", crumb } satisfies SyncMessage);
}

export function getBreadcrumbs(): readonly Breadcrumb[] {
  if (pruneExpired()) listeners.forEach((l) => l());
  return trail;
}

export function clearBreadcrumbs() {
  trail.length = 0;
  save();
  listeners.forEach((l) => l());
  channel?.postMessage({ type: "clear" } satisfies SyncMessage);
}

export function formatBreadcrumbs(): string {
  pruneExpired();
  const now = Date.now();
  return trail
    .map((b) => {
      const ago = Math.round((now - b.ts) / 100) / 10;
      return `[${b.kind}] ${b.label}  (${ago}s ago)`;
    })
    .join("\n");
}

export function subscribeBreadcrumbs(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (channel) {
  channel.onmessage = (e: MessageEvent<SyncMessage>) => {
    const msg = e.data;
    if (!msg) return;
    if (msg.type === "push") {
      applyPush(msg.crumb);
    } else if (msg.type === "clear") {
      trail.length = 0;
      save();
      listeners.forEach((l) => l());
    } else if (msg.type === "replace") {
      trail.length = 0;
      trail.push(...msg.trail.slice(-MAX));
      save();
      listeners.forEach((l) => l());
    }
  };
}