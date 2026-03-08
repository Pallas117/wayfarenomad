

## Plan: Full-Screen Map Pulse Landing + Resource Layer

### Overview
Two priorities: (1) Make Pulse the default landing page with a full-screen map and an "Intrepid Mode" topographic toggle, and (2) add a Resource Layer with Steward-vetted "Functional Points" (wet markets, water, secure nooks) as map filters.

### 1. Pulse as Default Landing with Full-Screen Map

**Route change** (`src/App.tsx`):
- Change `<Route index element={<Navigate to="/social" replace />} />` to navigate to `/pulse` instead.

**Pulse page redesign** (`src/pages/Pulse.tsx`):
- Remove `max-w-lg mx-auto` constraint and `p-6` padding. Make the map fill the viewport (`h-[calc(100vh-8rem)]`) behind all UI.
- Map is always visible (remove `showMap` toggle). Replace the 240px map with a full-screen map as the page background.
- Overlay controls (city tabs, category filters, scrape button, CulturalEar) as floating glass panels on top of the map using `absolute`/`fixed` positioning.
- Add a bottom drawer/sheet (using `vaul` Drawer) that slides up to show the event card list, replacing the inline list. Users swipe up to browse events.

**Intrepid Mode toggle**:
- Add an "Intrepid Mode" toggle button in the floating controls.
- When active, swap the CartoDB dark tile URL to a topographic tile layer (e.g., OpenTopoMap) and apply a CSS filter for gold-tinted high-contrast.
- Store preference in `localStorage`.

**MapView updates** (`src/components/MapView.tsx`):
- Accept a new `tileUrl` prop (default: current dark CartoDB). Pulse passes the topo URL when Intrepid Mode is on.
- Add a new pin type `"resource"` with distinct icon styling.

### 2. Resource Layer (Functional Points)

**Database migration** - new `functional_points` table:
```sql
CREATE TABLE public.functional_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL, -- 'wet_market', 'water', 'secure_nook'
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  city text NOT NULL,
  description text,
  address text,
  verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.functional_points ENABLE ROW LEVEL SECURITY;

-- All authenticated can view
CREATE POLICY "Authenticated can view functional points"
ON public.functional_points FOR SELECT TO authenticated
USING (true);

-- Stewards can insert
CREATE POLICY "Stewards can add functional points"
ON public.functional_points FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by AND has_min_rank(auth.uid(), 1));

-- Stewards can update own
CREATE POLICY "Stewards can update functional points"
ON public.functional_points FOR UPDATE TO authenticated
USING (auth.uid() = created_by);
```

**MapPin type update** (`src/components/MapView.types.ts`):
- Add `"resource"` to the `type` union.
- Add resource-specific categories.

**MapView icon update** (`src/components/MapView.tsx`):
- Add pin SVGs and colors for `wet_market`, `water`, `secure_nook`.

**Pulse integration**:
- Fetch `functional_points` from the database.
- Add a "Resources" filter toggle in the floating controls (chip buttons for each resource type).
- Merge resource pins into `mapPins` array when their filters are active.
- Pin popups show name, description, verified badge.

**Add Resource form**:
- Behind `RoleGate` (Steward+), a floating "+" button opens a dialog to add a new Functional Point with the existing `LocationPicker` for coordinates, category select, name, and description.

### Files to Create/Modify

| File | Action |
|---|---|
| `src/App.tsx` | Change default route to `/pulse` |
| `src/pages/Pulse.tsx` | Full rewrite: full-screen map, floating controls, bottom drawer, Intrepid Mode, resource filters |
| `src/components/MapView.tsx` | Add `tileUrl` prop, resource pin icons |
| `src/components/MapView.types.ts` | Add `"resource"` type |
| `supabase/migrations/` | Create `functional_points` table |

### Technical Notes
- The bottom drawer uses the existing `vaul` dependency.
- Topographic tiles: `https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png` with a CSS `filter: sepia(0.3) saturate(1.4) brightness(0.9)` for the gold-tinted Celestial feel.
- Intrepid Mode class on the map container applies the filter via Tailwind arbitrary values.

