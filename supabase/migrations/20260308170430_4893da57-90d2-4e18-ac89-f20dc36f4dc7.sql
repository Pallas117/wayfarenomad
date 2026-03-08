
-- Add columns for user-submitted events
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS submitted_by uuid,
  ADD COLUMN IF NOT EXISTS is_user_submitted boolean NOT NULL DEFAULT false;

-- Allow any authenticated user to insert events (user submissions)
CREATE POLICY "Authenticated users can submit events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
