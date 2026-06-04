
-- =========================================================
-- 1) PROFILES: hide sensitive columns from other users
-- =========================================================
REVOKE SELECT (encrypted_private_key, whatsapp_number, telegram_handle, instagram_handle)
  ON public.profiles FROM anon, authenticated;

-- Owner-only RPC to read own private contact fields
CREATE OR REPLACE FUNCTION public.get_my_private_profile()
RETURNS TABLE (
  instagram_handle text,
  telegram_handle text,
  whatsapp_number text,
  encrypted_private_key text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT instagram_handle, telegram_handle, whatsapp_number, encrypted_private_key
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_private_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_private_profile() TO authenticated;

-- Owner-only RPC to update own private contact fields
CREATE OR REPLACE FUNCTION public.update_my_private_profile(
  _instagram_handle text DEFAULT NULL,
  _telegram_handle text DEFAULT NULL,
  _whatsapp_number text DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
  SET instagram_handle = _instagram_handle,
      telegram_handle = _telegram_handle,
      whatsapp_number = _whatsapp_number,
      updated_at = now()
  WHERE user_id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.update_my_private_profile(text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_my_private_profile(text,text,text) TO authenticated;

-- =========================================================
-- 2) ITINERARIES: owner-only SELECT
-- =========================================================
DROP POLICY IF EXISTS "Users can view all itineraries" ON public.itineraries;
CREATE POLICY "Users can view own itineraries"
  ON public.itineraries FOR SELECT
  USING (auth.uid() = user_id);

-- =========================================================
-- 3) MUSIC IDENTIFICATIONS: owner-only SELECT
-- =========================================================
DROP POLICY IF EXISTS "Users can view recent identifications" ON public.music_identifications;
CREATE POLICY "Users can view own identifications"
  ON public.music_identifications FOR SELECT
  USING (auth.uid() = user_id);

-- =========================================================
-- 4) SOS RESPONSES: only beacon owner + responder can see
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can view sos responses" ON public.sos_responses;
CREATE POLICY "Beacon owner and responder can view sos responses"
  ON public.sos_responses FOR SELECT
  USING (
    auth.uid() = responder_id
    OR EXISTS (
      SELECT 1 FROM public.emergency_beacons b
      WHERE b.id = sos_responses.beacon_id AND b.user_id = auth.uid()
    )
  );

-- =========================================================
-- 5) ROAMING BEACONS: stewards+ only can see active feed
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can view active beacons" ON public.roaming_beacons;
CREATE POLICY "Stewards can view active beacons"
  ON public.roaming_beacons FOR SELECT
  USING (
    auth.uid() = user_id
    OR (expires_at > now() AND public.has_min_rank(auth.uid(), 1))
  );

-- =========================================================
-- 6) STORAGE: community-photos ownership checks
-- =========================================================
DROP POLICY IF EXISTS "Anyone can view community photos" ON storage.objects;
CREATE POLICY "Authenticated can view community photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'community-photos');

DROP POLICY IF EXISTS "Authenticated can upload community photos" ON storage.objects;
CREATE POLICY "Users can upload own community photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'community-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own community photos" ON storage.objects;
CREATE POLICY "Users can delete own community photos v2"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'community-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =========================================================
-- 7) REALTIME: require authenticated for channel subscription
-- =========================================================
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can use realtime" ON realtime.messages;
CREATE POLICY "Authenticated can use realtime"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (true);

-- =========================================================
-- 8) Lock down SECURITY DEFINER helpers from anon
-- =========================================================
REVOKE EXECUTE ON FUNCTION public.award_stardust(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.promote_to_steward(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.promote_to_captain(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_min_rank(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_rank(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_compass_locked(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_join_group(uuid, uuid) FROM anon;
