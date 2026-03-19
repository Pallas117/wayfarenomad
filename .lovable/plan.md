

## Plan: Archive Marketplace, Add Luma Integration to Pulse, Add Itinerary Flows to Chat

### 1. Archive the Marketplace

- Remove `/marketplace` route from `App.tsx`
- Remove the Marketplace tab from `BottomNav.tsx` (the SailboatIcon "Market" entry)
- Keep the `Marketplace.tsx` file and expedition hooks intact (expeditions are referenced elsewhere) but the page becomes inaccessible
- The bottom nav will have 4 tabs: Social, Chat, Pulse, Safety (+ Settings)

### 2. Luma Calendar Embed in Pulse

- Add a "Luma Events" section to the Pulse page with an embedded Luma calendar widget
- Luma provides embeddable calendars via `<iframe src="https://lu.ma/embed/calendar/...">`. Add an input or config for the Luma calendar URL
- Create a `LumaCalendarEmbed` component that renders the iframe with proper styling
- Place it as a new tab or section in the Pulse page alongside existing event categories

### 3. Auto-Scrape Luma Events via Firecrawl

- Create a new edge function `supabase/functions/scrape-luma/index.ts` that:
  - Uses the existing Firecrawl connector to scrape Luma event pages for configured cities
  - Parses event data (title, date, venue, description, URL)
  - Inserts them into the `events` table with `scraped_from = 'luma'` and `verification_status = 'scraped'`
- Add a "Sync Luma" button in the Pulse admin area (steward+ only) that triggers the scrape
- Scraped Luma events will appear in the existing Pulse feed with a Luma badge

### 4. Share Itinerary Card in Chat

- Create an `ItineraryShareCard` component that renders a rich card showing city, dates, and teaches/learns
- Add a "Share Itinerary" button (e.g. calendar icon) to the `ChatView` input area
- When tapped, it sends a specially formatted message (e.g. JSON-prefixed content) that renders as a rich itinerary card in the chat bubble
- The `MessageBubble` component will detect itinerary messages and render them as cards instead of plain text

### 5. Suggest Meetup from Itinerary Overlap

- In the `ChatView`, when a chat is opened, check if the current user and recipient have overlapping itineraries using the existing `calculateOverlap` logic
- If overlap exists, show a contextual banner at the top of the chat: "You'll both be in [City] for [X] days! Schedule a meetup?"
- Tapping the banner opens a quick meetup scheduling flow that creates an `instant_meetups` record with a suggested time
- This creates a smoother flow than competitors who require separate discovery steps

### Technical Details

**Files to modify:**
- `src/App.tsx` — remove marketplace route
- `src/components/BottomNav.tsx` — remove marketplace tab
- `src/pages/Pulse.tsx` — add Luma embed section + sync button
- `src/components/ChatView.tsx` — add itinerary share button, overlap banner, meetup suggestion
- `src/components/ChatView.tsx` → `MessageBubble` — detect and render itinerary cards

**New files:**
- `src/components/LumaCalendarEmbed.tsx` — iframe embed component
- `src/components/ItineraryShareCard.tsx` — rich card component for chat
- `src/components/ChatOverlapBanner.tsx` — overlap detection + meetup prompt
- `supabase/functions/scrape-luma/index.ts` — Firecrawl-powered Luma scraper

**Edge function:** Uses existing `FIRECRAWL_API_KEY` secret. Scrapes `lu.ma/city/[city]` pages, extracts event data, upserts into `events` table.

**No DB migrations needed** — events table already supports `scraped_from`, `source_url`, and all required fields. Instant meetups table already exists.

