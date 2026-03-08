-- Add social profile fields for verification
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS telegram_handle text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS substack_url text,
  ADD COLUMN IF NOT EXISTS social_verified boolean DEFAULT false;

-- Add scraped_from column to track source
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS scraped_from text;

-- Allow stewards to update events (for verification)
CREATE POLICY "Stewards can update events"
  ON public.events FOR UPDATE TO authenticated
  USING (has_min_rank(auth.uid(), 1))
  WITH CHECK (has_min_rank(auth.uid(), 1));