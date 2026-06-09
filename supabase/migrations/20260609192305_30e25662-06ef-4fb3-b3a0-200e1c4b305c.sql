DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT user_id, display_name, bio, avatar_url, current_city, teaches, learns,
       stardust_points, vision_completed, quiz_completed, social_verified,
       travel_start, travel_end, vision_statement, bridge, leaderboard_anonymous,
       google_guide_url, google_guide_level, google_guide_points, google_guide_reviews,
       created_at
FROM public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;