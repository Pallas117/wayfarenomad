

## Plan: Expand Event Categories + Add "Alien" Tab

### Overview
Replace the current 3 categories (music, tech, festival) with 13 categories including a special "Alien" category for unique, uncategorizable events. Update both the Pulse UI filters and the scraper's classification logic.

### Categories (13 total)
| Category | Icon (lucide) | Scraper Keywords |
|----------|--------------|-----------------|
| wellbeing | Heart | yoga, meditation, wellness, spa, mindfulness |
| culture | Landmark | museum, gallery, heritage, temple, history |
| entertainment | Clapperboard | comedy, show, cinema, theater, concert |
| shopping | ShoppingBag | market, bazaar, sale, pop-up, fair |
| nature | TreePine | hike, park, garden, wildlife, eco |
| event | CalendarDays | conference, meetup, workshop, seminar |
| festival | PartyPopper | festival, carnival, parade, celebration |
| nightlife | Moon | club, bar, DJ, lounge, party |
| fitness | Dumbbell | gym, run, marathon, crossfit, sports |
| adventure | Compass | diving, kayak, climbing, extreme, surf |
| creative | Palette | art, design, craft, photography, music |
| singles | HeartHandshake | singles, dating, mixer, speed-dating, social |
| **alien** | **Skull** | _(no keywords -- catch-all for user-submitted oddities + unclassifiable scraped events)_ |

### Files to Edit

**1. `src/pages/Pulse.tsx`**
- Replace `categories` array with all 13 + "all"
- Make filter row horizontally scrollable (`overflow-x-auto`, `flex-nowrap`)
- Update `categoryIcon` map for event card icons
- Import new lucide icons: `Heart, Landmark, Clapperboard, ShoppingBag, TreePine, CalendarDays, Moon, Dumbbell, Compass, Palette, HeartHandshake, Skull`

**2. `supabase/functions/scrape-events/index.ts`**
- Replace the existing `if/else` category classification with a keyword map covering all 13 categories
- Default fallback category changes from `'festival'` to `'event'`
- "alien" is never auto-assigned by scraper -- reserved for user submissions

### No database migration needed
The `category` column on `events` is already `text` type, so new string values work immediately.

