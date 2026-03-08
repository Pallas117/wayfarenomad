
-- Music identifications table for Cultural Ear
CREATE TABLE public.music_identifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_title text NOT NULL,
  track_artist text NOT NULL,
  genre text,
  origin text,
  lat double precision,
  lng double precision,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.music_identifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view recent identifications"
  ON public.music_identifications FOR SELECT
  TO authenticated
  USING (created_at > now() - interval '24 hours');

CREATE POLICY "Users can insert own identifications"
  ON public.music_identifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for shared vibes
ALTER PUBLICATION supabase_realtime ADD TABLE public.music_identifications;
