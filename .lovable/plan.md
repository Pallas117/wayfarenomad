# Analogue Retro-Tech Redesign

A focused frontend reskin. No backend, auth, or schema changes — alpha mock auth stays in place and the existing Supabase data layer is untouched. Three new "tactile" views replace the primary navigation surface; legacy pages remain reachable but are demoted.

## Scope

In scope (frontend / presentation only):
- New design tokens (cream parchment, ink black, amber, olive, terracotta)
- New typography pairing (Plus Jakarta Sans + JetBrains Mono)
- Hard-shadow / stamped-paper component primitives
- 3 new screens: Bulletin Board, Logbook, Ticket Counter
- New vertical "radio dial" sidebar (replacing the bottom nav as primary chrome on desktop; bottom nav kept on mobile)
- Micro-interactions: press-down buttons, flip toggles, stamp animation, Framer Motion page transitions

Out of scope:
- Backend / RLS / migrations
- Auth changes
- Data model changes
- Removing existing routes (Pulse, Social, Safety, Leaderboard, Profile, Settings, Messages, Krabi) — these continue to work with the new theme tokens
- Touching Celestial theme on `/vision-quest` or `/krabi` (those keep their bespoke palettes)

## Theme Strategy

The current app is locked to the Celestial (navy + gold) palette via `mem://style/celestial-theme`. Two options:

**A. Replace the global theme** — overwrite `:root` tokens in `index.css` with the new parchment palette. Existing pages instantly adopt the new look but may need spot fixes where they assumed a dark background.

**B. Scope the new theme to a `.retro` wrapper** — keep Celestial as default; apply the new tokens only on the 3 new views.

Recommendation: **Option A.** The user's brief explicitly contradicts the Celestial memory ("warm cream parchment, ink black, vintage accents"), so the redesign supersedes it. I will update the memory after build. Spot-fix any obviously broken legacy screens (Pulse map, Leaderboard).

## Design Tokens (index.css)

```
--background: 40 40% 97%       /* #FDFBF7 parchment */
--foreground: 0 0% 10%         /* #1A1A1A ink */
--card:       40 40% 99%
--border:     0 0% 10%         /* hard ink borders */
--primary:    33 100% 55%      /* #FF9F1C amber */
--secondary:  74 31% 33%       /* #606C38 olive */
--destructive:357 75% 50%      /* #D62828 terracotta */
--muted:      40 25% 90%
--radius:     0.25rem          /* crisper corners */
```

Add utilities:
- `.shadow-stamp` → `4px 4px 0 0 hsl(var(--foreground))`
- `.shadow-stamp-sm` → `2px 2px 0 0 hsl(var(--foreground))`
- `.press` → translate + shadow removal on `:active`
- `.paper` → subtle noise overlay (reuse existing `.paper-grain`)
- `.tape-label` → rotated label-maker chip
- `.perforated` → dashed top/bottom borders for ticket stubs
- `.led-dot` → pulsing green active indicator

Fonts: swap Google Fonts import to `Plus Jakarta Sans` + keep `JetBrains Mono` + `Courier Prime`. Drop Cinzel/Cormorant from default `body`/`h1-6` (keep available for legacy Celestial use).

## New Components

`src/components/retro/`
- `RadioDialSidebar.tsx` — vertical instrument-panel nav, fixed left on `md+`, with knob-style active indicator
- `StampButton.tsx` — primary button with press-down + hard shadow
- `FlipToggle.tsx` — physical toggle switch
- `TapeLabel.tsx` — rotated label-maker filter chip
- `PolaroidAvatar.tsx` — square framed avatar with tape corners
- `TicketStub.tsx` — perforated card primitive with date-stamp slot
- `Pinned.tsx` — corkboard pin icon for cards
- `PageTransition.tsx` — Framer Motion wrapper for route changes

## New Views

`src/pages/retro/BulletinBoard.tsx` (`/board`)
- Corkboard background (subtle cork texture or warm noise)
- Masonry of post cards, each rotated `-2°..+2°`, with `Pinned` icon
- Filter rail of `TapeLabel` chips: Meetups, Wifi Spots, Housing, General Chaos
- Floating "Leave a Note" StampButton → opens notepad modal (lined-paper textarea)
- Seeded with ~12 mock posts (no DB write — pure local state for alpha)

`src/pages/retro/Logbook.tsx` (`/logbook`)
- Header: monospace "CURRENT COORDINATES: <CITY>" pulled from existing `CitySync` context
- Grid of Passport/ID-badge cards: PolaroidAvatar + name + role + country stamps + `led-dot` for active
- Filter row: All / Active Now / Recently Arrived
- Uses existing mock nomads list or seeds new array

`src/pages/retro/TicketCounter.tsx` (`/tickets`)
- Vertical stack of `TicketStub` event cards
- Big date stamp on the left, event details center, RSVP StampButton right
- RSVP click → Framer Motion stamp animation overlays "CLAIMED" terracotta stamp on the stub
- Seeded with mock events

## Routing & Navigation

`src/App.tsx`:
- Add 3 routes under `AppLayout`: `/board`, `/logbook`, `/tickets`
- Change index redirect from `/pulse` to `/board`

`src/components/AppLayout.tsx`:
- On `md+`: render `RadioDialSidebar` (left, fixed, ~72px wide collapsed / 220px expanded)
- On mobile: keep existing `BottomNav` but restyle items
- Wrap `<Outlet />` in `PageTransition`

`src/components/BottomNav.tsx`:
- Update items to include the 3 new views as primary; demote Pulse/Social/Safety/Leaderboard to a "More" overflow

Alpha banner + Hub indicator: keep, restyled as a ticker strip in mono type.

## Micro-interactions

- StampButton: `active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`
- FlipToggle: CSS-only flip with `transform: rotateX` on the lever
- Stamp animation: Framer Motion `initial={{scale:2, rotate:-20, opacity:0}}` → `animate={{scale:1, rotate:-8, opacity:1}}` with bounce
- Page transition: fade + 8px slide, 180ms

## Files

Create:
- `src/components/retro/{RadioDialSidebar,StampButton,FlipToggle,TapeLabel,PolaroidAvatar,TicketStub,Pinned,PageTransition,LeaveNoteModal}.tsx`
- `src/pages/retro/{BulletinBoard,Logbook,TicketCounter}.tsx`
- `src/data/mockBoard.ts`, `src/data/mockTickets.ts`

Edit:
- `src/index.css` — new tokens, font import, utilities
- `tailwind.config.ts` — register fonts and shadow utilities
- `src/App.tsx` — new routes, default redirect
- `src/components/AppLayout.tsx` — sidebar + transitions
- `src/components/BottomNav.tsx` — new primary items
- `src/components/ui/button.tsx` — add `stamp` variant
- `mem://index.md` + `mem://style/celestial-theme` — supersede with new analogue palette

Framer Motion is already a transitive dep in the project; if missing I will `bun add framer-motion`.

## Verification

- Build passes (auto-run)
- Visit `/board`, `/logbook`, `/tickets` in mobile + desktop viewports, confirm sidebar/bottom-nav switch
- Confirm RSVP stamp animation fires
- Confirm legacy `/pulse` still renders without crashes under new tokens (spot-fix card backgrounds if needed)

## Risks

- Map view in `/pulse` was tuned for dark navy; tiles may look washed out on cream. Plan: add a `data-theme="dark"` opt-in on Pulse map container if it looks broken.
- Strong existing use of `text-glow-gold` / `gradient-gold` across legacy screens — these will render as amber gradients on cream, which is on-brand for the new look but may need contrast tweaks per screen (deferred to follow-up).
