

## Testing Results

**Drawer works correctly**: Hot Right Now shows top 3 events, followed by the full event list with Register, Add to Cal, and Create Hangout action buttons on every card. Map pin click opens the drawer and scrolls to the focused event card.

**Karma Pulses section**: The code is in place (lines 539-576) but hidden because `karmaPulses.length > 0` evaluates to false -- there's no community verification, SOS response, or safe space data in the database yet. Once users start verifying events, responding to SOS beacons, or adding safe spaces, the feed will appear between Hot Right Now and the event list. This is working as designed.

---

## Flow Interlinking Plan

Here are the cross-page connections that would make the experience seamless:

### 1. Hangout Card → Pulse Map Focus
When viewing a hangout on the Social page, add a "View on Map" button that navigates to `/pulse` and focuses the map on that hangout's pin. Currently hangouts appear as pins on the Pulse map but there's no way to jump from Social → Pulse for a specific hangout.

**Files**: `src/components/HangoutCard.tsx`, use `useNavigate` with state param `?focus=hangoutId`

### 2. Expedition → Pulse Map Pin
Expeditions from the Marketplace have lat/lng but don't appear on the Pulse map. Add expedition pins to the map so users can discover them geographically, and link expedition cards to the map view.

**Files**: `src/pages/Pulse.tsx` (add expedition query to mapPins), `src/components/ExpeditionCard.tsx` (add "View on Map" link)

### 3. Safe Spaces → Pulse Map Layer
Safe spaces from the Safety page have lat/lng but are only listed in Safety. Add them as a toggleable resource layer on the Pulse map (like the existing wet_market/water/secure_nook filters), so travelers can see safety resources while browsing events.

**Files**: `src/pages/Pulse.tsx` (add safe_spaces filter + query)

### 4. Profile → Karma Activity
On a user's profile page, show their recent karma-earning actions (verifications, SOS responses, safe spaces added). Links back to the events/spaces they contributed to.

**Files**: `src/pages/Profile.tsx`

### 5. Event → Social Match
When viewing an event, show which of your itinerary matches are in the same city during the event date. "3 matches nearby" badge on event cards linking to the Social discover tab filtered by that city.

**Files**: `src/pages/Pulse.tsx` (event card enrichment)

### Recommended Build Order
1. **Safe Spaces as Pulse map layer** -- Quick win, data already exists, just needs a filter toggle and query
2. **Hangout "View on Map" link** -- Simple navigation with query param
3. **Expedition pins on Pulse map** -- Adds marketplace discovery to the map
4. **Profile karma activity** -- Deepens the reputation system
5. **Event → Social match overlay** -- Most complex, highest impact for community formation

