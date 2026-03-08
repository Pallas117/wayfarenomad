
-- Update handle_new_user to assign 'initiate' instead of 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'initiate');
  
  RETURN NEW;
END;
$$;

-- Helper: get user's highest rank
CREATE OR REPLACE FUNCTION public.get_user_rank(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(
    CASE role::text
      WHEN 'initiate' THEN 0
      WHEN 'user' THEN 0
      WHEN 'steward' THEN 1
      WHEN 'captain' THEN 2
      WHEN 'moderator' THEN 2
      WHEN 'admin' THEN 3
      ELSE 0
    END
  ), 0)
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Helper: check minimum rank
CREATE OR REPLACE FUNCTION public.has_min_rank(_user_id UUID, _min_rank INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_rank(_user_id) >= _min_rank
$$;

-- Promote to steward after vision + quiz
CREATE OR REPLACE FUNCTION public.promote_to_steward(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND vision_completed = true AND quiz_completed = true
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'steward')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Promote to captain after 3 expeditions + 500 stardust
CREATE OR REPLACE FUNCTION public.promote_to_captain(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  completed_expeditions INTEGER;
  user_stardust INTEGER;
BEGIN
  SELECT COUNT(*) INTO completed_expeditions
  FROM public.expeditions
  WHERE host_id = _user_id AND status = 'completed';

  SELECT stardust_points INTO user_stardust
  FROM public.profiles WHERE user_id = _user_id;

  IF completed_expeditions >= 3 AND COALESCE(user_stardust, 0) >= 500 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'captain')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;
