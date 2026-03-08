
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS flag_count integer NOT NULL DEFAULT 0;

CREATE TABLE public.event_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth can view flags" ON public.event_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can flag events" ON public.event_flags FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.on_event_flagged()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.events SET flag_count = flag_count + 1 WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER event_flag_trigger AFTER INSERT ON public.event_flags
FOR EACH ROW EXECUTE FUNCTION public.on_event_flagged();
