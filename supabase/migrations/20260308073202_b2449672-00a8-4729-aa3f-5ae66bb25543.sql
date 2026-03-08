
-- Emergency beacons table (SOS alerts for verified Steward+ users)
CREATE TABLE public.emergency_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.emergency_beacons ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see active emergency beacons (safety first)
CREATE POLICY "Authenticated can view active emergency beacons"
  ON public.emergency_beacons FOR SELECT TO authenticated
  USING (status = 'active');

-- Only steward+ can create emergency beacons
CREATE POLICY "Stewards can create emergency beacons"
  ON public.emergency_beacons FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_min_rank(auth.uid(), 1)
  );

-- Users can update own beacons (resolve)
CREATE POLICY "Users can update own emergency beacons"
  ON public.emergency_beacons FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Safe spaces directory
CREATE TABLE public.safe_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  city TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.safe_spaces ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view safe spaces
CREATE POLICY "Authenticated can view safe spaces"
  ON public.safe_spaces FOR SELECT TO authenticated
  USING (true);

-- Steward+ can add safe spaces
CREATE POLICY "Stewards can add safe spaces"
  ON public.safe_spaces FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND public.has_min_rank(auth.uid(), 1)
  );

-- Steward+ can update safe spaces they created
CREATE POLICY "Stewards can update own safe spaces"
  ON public.safe_spaces FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);
