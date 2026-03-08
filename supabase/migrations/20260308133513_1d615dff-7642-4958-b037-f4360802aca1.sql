
-- Group chats table
CREATE TABLE public.group_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hangout_id uuid REFERENCES public.hangouts(id) ON DELETE SET NULL,
  expedition_id uuid REFERENCES public.expeditions(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Group chat members
CREATE TABLE public.group_chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_chat_id uuid REFERENCES public.group_chats(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_chat_id, user_id)
);

-- Group messages
CREATE TABLE public.group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_chat_id uuid REFERENCES public.group_chats(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Helper function: check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_chat_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_chat_members
    WHERE user_id = _user_id AND group_chat_id = _group_chat_id
  )
$$;

-- Group chats RLS
CREATE POLICY "Members can view group chats"
  ON public.group_chats FOR SELECT
  TO authenticated
  USING (public.is_group_member(auth.uid(), id));

CREATE POLICY "Stewards can create group chats"
  ON public.group_chats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by AND public.has_min_rank(auth.uid(), 1));

-- Group chat members RLS
CREATE POLICY "Members can view group members"
  ON public.group_chat_members FOR SELECT
  TO authenticated
  USING (public.is_group_member(auth.uid(), group_chat_id));

CREATE POLICY "Users can join groups"
  ON public.group_chat_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.group_chat_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Group messages RLS
CREATE POLICY "Members can view group messages"
  ON public.group_messages FOR SELECT
  TO authenticated
  USING (public.is_group_member(auth.uid(), group_chat_id));

CREATE POLICY "Members can send group messages"
  ON public.group_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.is_group_member(auth.uid(), group_chat_id));

-- Enable realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;

-- Trigger: auto-create group chat when hangout is created
CREATE OR REPLACE FUNCTION public.on_hangout_create_group_chat()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  new_group_id uuid;
BEGIN
  INSERT INTO public.group_chats (name, hangout_id, created_by)
  VALUES (NEW.title, NEW.id, NEW.creator_id)
  RETURNING id INTO new_group_id;

  INSERT INTO public.group_chat_members (group_chat_id, user_id)
  VALUES (new_group_id, NEW.creator_id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_hangout_create_group_chat
  AFTER INSERT ON public.hangouts
  FOR EACH ROW
  EXECUTE FUNCTION public.on_hangout_create_group_chat();
