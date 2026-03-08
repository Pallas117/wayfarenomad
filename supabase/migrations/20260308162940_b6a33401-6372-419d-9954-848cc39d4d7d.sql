
-- Compass Lock: verified in-person connections
CREATE TABLE public.compass_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  verification_method text NOT NULL DEFAULT 'qr',
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_a, user_b)
);

ALTER TABLE public.compass_locks ENABLE ROW LEVEL SECURITY;

-- Users can view their own compass locks
CREATE POLICY "Users can view own compass locks"
ON public.compass_locks FOR SELECT
TO authenticated
USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Users can create compass locks
CREATE POLICY "Users can create compass locks"
ON public.compass_locks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_a);

-- Function to check if two users are compass-locked
CREATE OR REPLACE FUNCTION public.is_compass_locked(_user_a uuid, _user_b uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.compass_locks
    WHERE (user_a = _user_a AND user_b = _user_b)
       OR (user_a = _user_b AND user_b = _user_a)
  )
$$;
