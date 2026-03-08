
-- Drop the overly permissive policy and replace with a scoped one
DROP POLICY IF EXISTS "Authenticated users can submit events" ON public.events;

CREATE POLICY "Authenticated users can submit own events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());
