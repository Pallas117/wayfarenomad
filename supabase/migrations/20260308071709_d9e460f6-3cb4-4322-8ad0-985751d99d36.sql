
-- Fix: restrict events insert to only admins/stewards via has_role
DROP POLICY "Authenticated can insert events" ON public.events;

CREATE POLICY "Stewards and admins can insert events" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'steward')
  );
