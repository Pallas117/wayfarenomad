## Goal

Shift the app's UI/UX toward a more **analogue, tactile** feel (inspired by the Scan Club piece: print-like textures, hand-set type, less digital gloss) and introduce a **third theme color: ink blue**, sitting alongside the existing Midnight Navy + Celestial Gold.

## Scope

Theme tokens, global utilities, and a few high-visibility surfaces (Pulse header, Chat, buttons, cards). No business logic changes.

## 1. New color token — Ink Blue

Add a third semantic accent that reads as fountain-pen / cyanotype ink, complementing gold:

- `--ink: 215 70% 42%` (deep azure ink)
- `--ink-glow: 210 85% 60%` (washed sky highlight)
- `--ink-deep: 220 75% 22%` (sediment shadow)
- `--ink-foreground: 40 10% 96%`

Wire into `tailwind.config.ts` as `ink: { DEFAULT, glow, deep }` plus a `gradient-ink` utility and `glow-ink` shadow in `index.css`. Used for: secondary CTAs, links/timestamps, info banners, the overlap-banner accent variant, verification chips that aren't gold-tier.

## 2. Analogue texture layer

Add reusable utilities in `index.css`:

- `.paper-grain` — subtle SVG noise (data-URI) at ~6% opacity over backgrounds
- `.deckled-edge` — soft, irregular border via layered `mask-image` instead of crisp 1px lines
- `.ink-bleed` — text-shadow blur in `--ink` for headings rendered in blue
- `.letterpress` — inset shadow giving buttons a pressed-in feel
- `.halftone` — small radial-gradient dot pattern for section dividers

Reduce default `--radius` from `0.75rem` to `0.375rem` so corners feel cut rather than extruded. Replace pure-black shadows with warm sepia tints (`hsl(35 30% 8% / .X)`).

## 3. Typography tuning (analogue feel)

- Keep Cinzel for display.
- Body: shift primary body to **Cormorant Garamond** (already loaded) for long-form copy; keep Inter for UI controls.
- Add `.handset` utility: slight letter-spacing variance, optical italic for emphasis, and a `font-feature-settings: "onum","liga"` rule on body for old-style numerals and ligatures.
- Reduce heading text-shadow glow; add faint blue ink-bleed instead of gold halo on H1s.

## 4. Surfaces to refresh (presentation only)

- **Buttons**: `secondary` variant repainted in `ink`; add `.letterpress` on `:active`.
- **Cards**: apply `.paper-grain` + sepia shadow, swap hairline borders for `border-ink/20`.
- **Pulse header & Luma toggle**: toggle uses ink-blue active state instead of gold (gold reserved for primary/verified).
- **ChatOverlapBanner**: matched state stays emerald; the non-matched / informational banner shifts to ink-blue with paper-grain bg.
- **Section dividers**: replace solid 1px lines with `.halftone` strips.

## 5. Out of scope

No changes to data models, queries, routes, RLS, or feature behavior. The debug panel, share button, and overlap logic remain untouched.

## Technical files touched

- `src/index.css` — new tokens, utilities, grain SVG, radius
- `tailwind.config.ts` — register `ink` color family
- `src/components/ui/button.tsx` — add ink secondary + letterpress active state
- `src/components/ChatOverlapBanner.tsx` — info variant restyle
- `src/pages/Pulse.tsx` (or Luma toggle component) — recolor toggle
- 1–2 card components for the paper-grain pass
