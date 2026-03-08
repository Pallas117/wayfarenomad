
-- Expedition bookings table
CREATE TABLE public.expedition_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expedition_id uuid NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (expedition_id, user_id)
);

ALTER TABLE public.expedition_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.expedition_bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can book expeditions" ON public.expedition_bookings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own bookings" ON public.expedition_bookings
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Hosts can view bookings for their expeditions
CREATE POLICY "Hosts can view expedition bookings" ON public.expedition_bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.expeditions
      WHERE id = expedition_bookings.expedition_id AND host_id = auth.uid()
    )
  );

-- Stardust increment functions
CREATE OR REPLACE FUNCTION public.award_stardust(_user_id uuid, _points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET stardust_points = COALESCE(stardust_points, 0) + _points
  WHERE user_id = _user_id;
END;
$$;

-- Trigger: award host 50 stardust when expedition is completed
CREATE OR REPLACE FUNCTION public.on_expedition_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM public.award_stardust(NEW.host_id, 50);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_expedition_completed
  AFTER UPDATE ON public.expeditions
  FOR EACH ROW
  EXECUTE FUNCTION public.on_expedition_completed();

-- Trigger: award booker 10 stardust on booking
CREATE OR REPLACE FUNCTION public.on_booking_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.award_stardust(NEW.user_id, 10);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_created
  AFTER INSERT ON public.expedition_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.on_booking_created();
