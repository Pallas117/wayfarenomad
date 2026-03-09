

## Bug Fix & Security Hardening Plan

Based on code review and security scan results, here are the issues to fix:

### 1. Security: Profiles table exposes sensitive data (CRITICAL)
The `profiles` SELECT policy uses `USING (true)`, exposing `encrypted_private_key`, `whatsapp_number`, `telegram_handle`, `instagram_handle`, and `full_name` to all authenticated users.

**Fix:** Create a database migration that:
- Drops the current permissive SELECT policy
- Adds two policies: one for own profile (full access), one for others (only safe public fields via a security definer view or by splitting into a `public_profiles` view)
- Since RLS can't restrict columns, create a `public_profiles` database view exposing only safe fields, and update the client code to use the view when viewing other users' profiles

### 2. Security: Group chat self-join vulnerability (CRITICAL)
The `group_chat_members` INSERT policy only checks `auth.uid() = user_id`, allowing any user to join any group chat.

**Fix:** Add a migration that tightens the INSERT policy to require either:
- The user is the group creator, OR
- An invitation exists (simplest: require `created_by = auth.uid()` on the group, or add an `invited_by` check)

### 3. Bug: `useAuth` fires multiple SIGNED_IN events
Console shows 10+ duplicate `SIGNED_IN` events. The `useEffect` in `useAuth.ts` calls both `onAuthStateChange` and `getSession`, and React StrictMode double-mounts. Not a critical bug but causes unnecessary re-renders.

**Fix:** Add a guard so `getSession` only sets state if `onAuthStateChange` hasn't already fired. Use a ref flag.

### 4. Bug: KrabiHub RSVP error handling is incomplete
The `handleRsvp` function uses try/catch but doesn't check for Supabase `error` on the response (only catches thrown errors). Supabase client returns `{ error }` rather than throwing.

**Fix:** Check `const { error } = await supabase.from("rsvps")...` and handle accordingly, same pattern as `NomadDebriefModal`.

### 5. Enable leaked password protection
Security scan warns this is disabled.

**Fix:** Use `cloud--configure_auth` to enable it.

---

### Implementation order (maximizing credit efficiency):
1. **DB migration** — Fix profiles exposure + group chat join vulnerability (single migration)
2. **Code fix** — Update Profile.tsx to use restricted view for other users' profiles
3. **Code fix** — Fix KrabiHub RSVP error handling
4. **Code fix** — Deduplicate useAuth state updates
5. **Auth config** — Enable leaked password protection

All changes are targeted, single-file edits or a single migration — efficient for remaining credits.

