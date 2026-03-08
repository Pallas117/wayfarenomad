
-- Create community photos table for the trust board
CREATE TABLE public.community_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  city text NOT NULL,
  event_title text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view photos
CREATE POLICY "Authenticated can view community photos"
  ON public.community_photos FOR SELECT TO authenticated
  USING (true);

-- Users can upload their own photos
CREATE POLICY "Users can upload own photos"
  ON public.community_photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
  ON public.community_photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for community photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-photos', 'community-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated can upload community photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'community-photos');

CREATE POLICY "Anyone can view community photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'community-photos');

CREATE POLICY "Users can delete own community photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'community-photos');
