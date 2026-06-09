ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS google_guide_url text,
  ADD COLUMN IF NOT EXISTS google_guide_level integer,
  ADD COLUMN IF NOT EXISTS google_guide_points integer,
  ADD COLUMN IF NOT EXISTS google_guide_reviews integer;