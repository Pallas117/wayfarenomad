
-- Fix the view to use SECURITY INVOKER (the safe default) instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
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

GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;
