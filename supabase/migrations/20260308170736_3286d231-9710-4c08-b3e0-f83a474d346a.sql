
-- Add cached reaction counts to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS star_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0;

-- Create event_reactions table
CREATE TABLE public.event_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL DEFAULT 'star',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id, reaction_type)
);

ALTER TABLE public.event_reactions ENABLE ROW LEVEL SECURITY;

-- RLS: anyone authenticated can view reactions (for counts)
CREATE POLICY "Authenticated can view reactions"
  ON public.event_reactions FOR SELECT TO authenticated
  USING (true);

-- RLS: users can insert their own reactions
CREATE POLICY "Users can add own reactions"
  ON public.event_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS: users can delete their own reactions
CREATE POLICY "Users can remove own reactions"
  ON public.event_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trigger function to update cached counts
CREATE OR REPLACE FUNCTION public.update_event_reaction_counts()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  target_event_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_event_id := OLD.event_id;
  ELSE
    target_event_id := NEW.event_id;
  END IF;

  UPDATE public.events SET
    star_count = (SELECT count(*) FROM public.event_reactions WHERE event_id = target_event_id AND reaction_type = 'star'),
    like_count = (SELECT count(*) FROM public.event_reactions WHERE event_id = target_event_id AND reaction_type = 'like')
  WHERE id = target_event_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

CREATE TRIGGER trg_event_reaction_counts
  AFTER INSERT OR DELETE ON public.event_reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_event_reaction_counts();
