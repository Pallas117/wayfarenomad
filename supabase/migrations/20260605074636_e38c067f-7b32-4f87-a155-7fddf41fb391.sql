
-- 1. Restrict sensitive profile columns: revoke column SELECT from anon/authenticated.
-- Owners read these via get_my_private_profile() (SECURITY DEFINER RPC).
REVOKE SELECT (whatsapp_number, telegram_handle, instagram_handle, encrypted_private_key)
  ON public.profiles FROM anon, authenticated, PUBLIC;

-- 2. Tighten emergency_beacons SELECT: only owner or stewards (rank >= 1) can see precise GPS.
DROP POLICY IF EXISTS "Authenticated can view active emergency beacons" ON public.emergency_beacons;
CREATE POLICY "Owners and stewards can view active beacons"
  ON public.emergency_beacons FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    AND (auth.uid() = user_id OR public.has_min_rank(auth.uid(), 1))
  );

-- 3. Revoke EXECUTE on SECURITY DEFINER helper functions from anon.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_min_rank(uuid, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_rank(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_compass_locked(uuid, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_join_group(uuid, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_private_profile() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_my_private_profile(text, text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.promote_to_steward(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.promote_to_captain(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_stardust(uuid, integer) FROM anon, authenticated, PUBLIC;
