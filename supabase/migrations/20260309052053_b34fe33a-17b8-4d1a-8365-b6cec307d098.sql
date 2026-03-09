
-- 1. Create a public_profiles view with only safe fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  user_id,
  display_name,
  bio,
  avatar_url,
  current_city,
  teaches,
  learns,
  stardust_points,
  vision_completed,
  quiz_completed,
  social_verified,
  travel_start,
  travel_end,
  vision_statement,
  bridge,
  leaderboard_anonymous,
  created_at
FROM public.profiles;

-- 2. Grant access to the view for authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- 3. Tighten group_chat_members INSERT policy
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can join groups" ON public.group_chat_members;

-- Create a security definer function to check if user is group creator or hangout/expedition attendee
CREATE OR REPLACE FUNCTION public.can_join_group(_user_id uuid, _group_chat_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User is the group creator
    SELECT 1 FROM public.group_chats
    WHERE id = _group_chat_id AND created_by = _user_id
  ) OR EXISTS (
    -- User is an attendee of the linked hangout
    SELECT 1 FROM public.group_chats gc
    JOIN public.hangout_attendees ha ON ha.hangout_id = gc.hangout_id
    WHERE gc.id = _group_chat_id AND ha.user_id = _user_id
  ) OR EXISTS (
    -- User has booked the linked expedition
    SELECT 1 FROM public.group_chats gc
    JOIN public.expedition_bookings eb ON eb.expedition_id = gc.expedition_id
    WHERE gc.id = _group_chat_id AND eb.user_id = _user_id
  )
$$;

-- New tighter policy: user can only join if they're the creator or a participant
CREATE POLICY "Users can join groups they belong to"
ON public.group_chat_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.can_join_group(auth.uid(), group_chat_id)
);
