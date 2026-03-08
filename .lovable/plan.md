

## Anonymise Karma Scores

### What
Add a `leaderboard_anonymous` boolean column to `profiles` (default `false`). When enabled, the user's name and avatar are replaced with "Anonymous Nomad" and a generic icon on all leaderboard/karma views, while their points still count toward rankings.

### Database Migration
- Add column: `ALTER TABLE public.profiles ADD COLUMN leaderboard_anonymous boolean NOT NULL DEFAULT false;`

### Settings Page (`src/pages/Settings.tsx`)
- Add a toggle in the profile/privacy section: "Hide my identity on leaderboards"
- Updates `profiles.leaderboard_anonymous` on toggle

### Leaderboard Page (`src/pages/Leaderboard.tsx`)
- Replace mock data with real query from `profiles` ordered by `stardust_points DESC`
- For rows where `leaderboard_anonymous = true`, display "Anonymous Nomad" as name, "??" as avatar initials, and hide city

### Safety Karma Tab (when built)
- Same anonymisation logic applied to karma rankings

### Files Modified
1. **Migration SQL** -- add `leaderboard_anonymous` column
2. **src/pages/Settings.tsx** -- add anonymity toggle
3. **src/pages/Leaderboard.tsx** -- switch to real data, apply anonymisation mask

