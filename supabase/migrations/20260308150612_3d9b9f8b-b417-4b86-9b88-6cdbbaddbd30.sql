
CREATE TABLE public.functional_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  city text NOT NULL,
  description text,
  address text,
  verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.functional_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view functional points"
ON public.functional_points FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Stewards can add functional points"
ON public.functional_points FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by AND public.has_min_rank(auth.uid(), 1));

CREATE POLICY "Stewards can update functional points"
ON public.functional_points FOR UPDATE TO authenticated
USING (auth.uid() = created_by);
