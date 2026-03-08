

## Current State Assessment

Wayfare already has solid foundations for connecting people:
- **Social page**: Itinerary-based matching with skill-swap and dating modes
- **MeetSync**: 1:1 meetup proposals with calendar/transit links
- **Messages**: 1:1 encrypted DMs
- **Pulse**: Event discovery with a placeholder map
- **Expeditions**: Multi-day group trips (Captain-only hosting)

**What's missing** (inspired by Nomadtable and Hostelworld):

1. **Interactive Map for Discovery** — The Pulse page has a static placeholder map. Users can't see where other nomads are or create pins on a map.
2. **Casual Hangout/Event Creator** — Expeditions are multi-day trips requiring Captain rank. There's no way for any user to create a simple "Coffee at 3pm" or "Coworking session tomorrow" hangout.
3. **Group Chats** — Messages are 1:1 only. No way to chat with multiple people around an event or hangout.

---

## Plan

### 1. Community Hangouts (Nomadtable-style casual meetups)

Create a new `hangouts` table and a lightweight creation form so any Steward+ user can post casual meetups (not just Captains with Expeditions).

- **Database**: New `hangouts` table with fields: `id`, `creator_id`, `title`, `description`, `location_name`, `lat`, `lng`, `hangout_time` (timestamp), `max_attendees`, `category` (coffee, coworking, nightlife, activity), `created_at`
- **Database**: New `hangout_attendees` table: `id`, `hangout_id`, `user_id`, `created_at`
- **RLS**: Authenticated users can view all hangouts; creators can insert; attendees can join/leave their own records
- **UI**: Add a "Hangouts" section to the Social page (or a new tab) with a creation form and attendee list
- **Map pins**: Each hangout gets a lat/lng so it can appear on a map

### 2. Interactive Map View

Replace the Pulse page's placeholder map with a real interactive map showing:
- Active roaming beacons (existing feature)
- Upcoming hangouts as pins
- Events from the Pulse feed

Use a free tile provider (OpenStreetMap via Leaflet/react-leaflet) — no API key required.

- **Install** `react-leaflet` and `leaflet`
- **Create** a reusable `MapView` component
- **Integrate** into the Pulse page, replacing the placeholder
- Users can tap pins to see hangout/event details and join

### 3. Group Chats

Extend the messaging system to support group conversations tied to hangouts or expeditions.

- **Database**: New `group_chats` table: `id`, `name`, `hangout_id` (nullable), `expedition_id` (nullable), `created_by`, `created_at`
- **Database**: New `group_chat_members` table: `id`, `group_chat_id`, `user_id`, `joined_at`
- **Database**: New `group_messages` table: `id`, `group_chat_id`, `sender_id`, `content`, `created_at`
- **Enable realtime** on `group_messages` for live updates
- **RLS**: Members can read/write messages in their groups; anyone joining a hangout auto-joins its group chat
- **UI**: Update the Messages page to show both 1:1 conversations and group chats in a tabbed view
- Auto-create a group chat when a hangout is created

---

## Technical Details

### Database migrations (3 migrations)

**Migration 1 — Hangouts**
```sql
CREATE TABLE public.hangouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  location_name text,
  lat double precision,
  lng double precision,
  hangout_time timestamptz NOT NULL,
  max_attendees integer DEFAULT 10,
  category text NOT NULL DEFAULT 'coffee',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.hangout_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hangout_id uuid REFERENCES public.hangouts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(hangout_id, user_id)
);

-- RLS on both tables
-- Stardust rewards: +5 for creating, +3 for joining
```

**Migration 2 — Group chats**
```sql
CREATE TABLE public.group_chats (...);
CREATE TABLE public.group_chat_members (...);
CREATE TABLE public.group_messages (...);
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
```

**Migration 3 — Trigger: auto-create group chat on hangout creation**

### New files
- `src/hooks/useHangouts.ts` — CRUD for hangouts + attendees
- `src/hooks/useGroupChat.ts` — group messaging with realtime
- `src/components/HangoutCard.tsx` — hangout display card
- `src/components/CreateHangoutForm.tsx` — creation modal
- `src/components/GroupChatView.tsx` — group chat UI
- `src/components/MapView.tsx` — Leaflet map component

### Modified files
- `src/pages/Social.tsx` — add Hangouts tab/section
- `src/pages/Messages.tsx` — add group chats tab
- `src/pages/Pulse.tsx` — replace placeholder map with MapView
- `src/components/ConversationList.tsx` — include group conversations
- `package.json` — add `leaflet`, `react-leaflet`, `@types/leaflet`

---

## Suggested Build Order

1. Hangouts tables + hooks + UI (biggest impact for connecting people)
2. Interactive map on Pulse page
3. Group chats (most complex, builds on hangouts)

Each phase is independently useful. Shall I proceed with Phase 1 (Hangouts)?

