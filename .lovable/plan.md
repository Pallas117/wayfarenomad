
# Nomad Community Platform — Implementation Plan

## Design System
- **Theme**: Midnight Navy (#0A142D) background with Coral Red (#FF6B6B) accents
- **Navigation**: Bottom tab bar with 4 tabs — Marketplace, Social, Pulse, Leaderboard
- **Typography**: Clean, modern sans-serif; dark theme throughout

## Phase 1: Foundation
- **Connect Lovable Cloud** for auth, database, and edge functions
- **Authentication**: Email + Google sign-in with user profiles (display name, avatar, bio, current city, travel dates)
- **Core layout**: App shell with bottom navigation tabs, responsive for mobile-first

## Phase 2: Social Discovery (Priority)
- **Profile setup**: "I can teach [X]" / "I want to learn [Y]" skill tags, current city, travel itinerary
- **Toggle switch**: Friendship mode (skill-swap focus) vs Dating mode (itinerary focus)
- **Matching**: Show users with overlapping travel dates in the same city
- **User cards**: Swipeable discovery cards showing skills, travel overlap indicator, compatibility score
- **Chat**: Basic messaging between matched users with meetup proposal button

## Phase 3: Community Pulse (Priority)
- **Connect Firecrawl** to scrape local events (festivals, concerts, tech meetups) based on user's city
- **Google Maps integration**: Display events as "Pulse Pins" on an interactive map
- **Event cards**: Title, date, venue, category tags, link to source
- **Location-based filtering**: Filter events by city/radius

## Phase 4: Gamification & Onboarding
- **Vision Statement**: 200-word writing challenge to unlock social features
- **Integrity Quiz**: 5 scenario-based questions to unlock Dating mode
- **Stardust points**: Earn reputation for verifying events, leading trips, positive reviews
- **Leaderboard**: Regional "Stellar Canopy" showing top contributors by hub (UK, Europe, Asia)

## Phase 5: Marketplace (Trips & Guides)
- **Trip creation form**: Host "Expeditions" with dates, costs, participant caps
- **Guide profiles**: Portfolio pages with skill tags and verification badges
- **Stripe payments**: Enable Stripe for trip booking and guide payouts

## Phase 6: Advanced Features
- **Roaming Beacons**: 4-hour "Nearby" toggle showing fuzzed location (2km radius) to other users
- **Meetup sync**: In-chat button proposing 1-hour meetups with travel time calculation
- **Google Calendar invite generation** for confirmed meetups

## Database Tables
- `profiles` — user details, city, bio, skills, travel dates
- `user_roles` — role-based access (user, steward, admin)
- `matches` — friendship/dating connections
- `messages` — encrypted chat messages
- `trips` — expedition listings
- `guides` — guide portfolios
- `events` — scraped community events
- `stardust_points` — reputation tracking
- `quiz_completions` — integrity quiz results
- `beacons` — temporary location shares
