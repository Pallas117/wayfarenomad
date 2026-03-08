
-- Add verification_status to events (3-tier: scraped → community_verified → admin_verified)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'scraped';

-- Backfill existing data
UPDATE public.events SET verification_status = 'admin_verified' WHERE verified = true;
UPDATE public.events SET verification_status = 'scraped' WHERE verified = false OR verified IS NULL;

-- Add community_verify_count to track how many community members verified
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS community_verify_count integer NOT NULL DEFAULT 0;

-- Community verifications tracking table
CREATE TABLE public.community_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  is_accurate boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.community_verifications ENABLE ROW LEVEL SECURITY;

-- RLS: authenticated can view
CREATE POLICY "Auth can view verifications" ON public.community_verifications
  FOR SELECT TO authenticated USING (true);

-- RLS: stewards+ can insert own verifications
CREATE POLICY "Stewards can verify events" ON public.community_verifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_min_rank(auth.uid(), 1));

-- Function to handle community verification + award points
CREATE OR REPLACE FUNCTION public.on_community_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  verify_count integer;
BEGIN
  -- Count verifications for this event
  SELECT count(*) INTO verify_count
  FROM public.community_verifications
  WHERE event_id = NEW.event_id AND is_accurate = true;

  -- Update the event's community_verify_count
  UPDATE public.events 
  SET community_verify_count = verify_count,
      verification_status = CASE 
        WHEN verify_count >= 3 THEN 'community_verified'
        ELSE verification_status
      END
  WHERE id = NEW.event_id AND verification_status = 'scraped';

  -- Award 5 stardust points for verification
  PERFORM public.award_stardust(NEW.user_id, 5);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_community_verification
  AFTER INSERT ON public.community_verifications
  FOR EACH ROW EXECUTE FUNCTION public.on_community_verification();
