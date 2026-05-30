// Lightweight in-memory breadcrumb trail for crash diagnostics.
// Records the last N route changes and UI section mounts so the
// ErrorBoundary can show what the user was looking at when it broke.

export type Breadcrumb = {
  ts: number;
  kind: "route" | "section" | "event";
  label: string;
};

const MAX = 20;
const STORAGE_KEY = "lovable.breadcrumbs.v1";

function load(): Breadcrumb[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Breadcrumb[];
    return Array.isArray(parsed) ? parsed.slice(-MAX) : [];
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

export function pushBreadcrumb(kind: Breadcrumb["kind"], label: string) {
  const last = trail[trail.length - 1];
  if (last && last.kind === kind && last.label === label) return;
  trail.push({ ts: Date.now(), kind, label });
  if (trail.length > MAX) trail.shift();
  save();
  listeners.forEach((l) => l());
}

export function getBreadcrumbs(): readonly Breadcrumb[] {
  return trail;
}

export function clearBreadcrumbs() {
  trail.length = 0;
  save();
  listeners.forEach((l) => l());
}

export function formatBreadcrumbs(): string {
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