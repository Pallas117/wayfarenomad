
-- Hangouts table
CREATE TABLE public.hangouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  location_name text,
  lat double precision,
  lng double precision,
  hangout_time timestamptz NOT NULL,
  max_attendees integer DEFAULT 10,
  category text NOT NULL DEFAULT 'coffee',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Hangout attendees table
CREATE TABLE public.hangout_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hangout_id uuid REFERENCES public.hangouts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(hangout_id, user_id)
);

-- Enable RLS
ALTER TABLE public.hangouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hangout_attendees ENABLE ROW LEVEL SECURITY;

-- Hangouts RLS policies
CREATE POLICY "Authenticated can view hangouts"
  ON public.hangouts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stewards can create hangouts"
  ON public.hangouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id AND public.has_min_rank(auth.uid(), 1));

CREATE POLICY "Creators can update own hangouts"
  ON public.hangouts FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own hangouts"
  ON public.hangouts FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Hangout attendees RLS policies
CREATE POLICY "Authenticated can view attendees"
  ON public.hangout_attendees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join hangouts"
  ON public.hangout_attendees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave hangouts"
  ON public.hangout_attendees FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger: award stardust on hangout creation
CREATE OR REPLACE FUNCTION public.on_hangout_created()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.award_stardust(NEW.creator_id, 5);
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_hangout_created
  AFTER INSERT ON public.hangouts
  FOR EACH ROW
  EXECUTE FUNCTION public.on_hangout_created();

-- Trigger: award stardust on joining hangout
CREATE OR REPLACE FUNCTION public.on_hangout_joined()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.award_stardust(NEW.user_id, 3);
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_hangout_joined
  AFTER INSERT ON public.hangout_attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.on_hangout_joined();
