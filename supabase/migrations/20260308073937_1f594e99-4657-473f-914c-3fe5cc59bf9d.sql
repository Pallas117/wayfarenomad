
-- SOS response tracking for Captain protocol
CREATE TABLE public.sos_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beacon_id UUID NOT NULL REFERENCES public.emergency_beacons(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'en_route',
  eta_minutes INTEGER,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  arrived_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.sos_responses ENABLE ROW LEVEL SECURITY;

-- All authenticated can view responses to active beacons
CREATE POLICY "Authenticated can view sos responses"
  ON public.sos_responses FOR SELECT TO authenticated
  USING (true);

-- Captain+ can respond to beacons
CREATE POLICY "Captains can respond to beacons"
  ON public.sos_responses FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = responder_id
    AND public.has_min_rank(auth.uid(), 1)
  );

-- Responders can update own responses
CREATE POLICY "Responders can update own responses"
  ON public.sos_responses FOR UPDATE TO authenticated
  USING (auth.uid() = responder_id);

-- Add escalation_level to emergency_beacons
ALTER TABLE public.emergency_beacons
  ADD COLUMN IF NOT EXISTS escalation_level INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS responder_count INTEGER NOT NULL DEFAULT 0;

-- Enable realtime for emergency beacons
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_beacons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_responses;
