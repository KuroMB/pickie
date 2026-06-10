-- Security hardening: fix overly permissive notifications policy and restrict
-- SECURITY DEFINER function access to appropriate roles only.

-- 1. Drop the notifications INSERT policy that allowed any role (including anon)
--    to insert rows. Service role bypasses RLS entirely, so no INSERT policy is needed.
DROP POLICY IF EXISTS "service role can insert notifications" ON notifications;

-- 2. Revoke PUBLIC execute on mutation functions (anon inherits PUBLIC).
--    Re-grant only to the roles that legitimately need them.

-- Authenticated-user functions (called from client during normal app use)
REVOKE EXECUTE ON FUNCTION public.create_household_and_join(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.create_household_and_join(text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.delete_meal(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.delete_meal(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.update_meal(uuid, text, text, text, date, integer) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.update_meal(uuid, text, text, text, date, integer) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.join_household_with_code(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.join_household_with_code(text) TO authenticated, service_role;

-- Trigger-only functions — should never be called directly via REST
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE EXECUTE ON FUNCTION public.sync_suggestion_upvotes() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.sync_suggestion_upvotes() TO service_role;
