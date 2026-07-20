
-- Lock down SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

-- Remove overly permissive INSERT policy; server function will use service role
DROP POLICY IF EXISTS "Anyone can submit registration" ON public.registrations;
REVOKE INSERT ON public.registrations FROM anon;
REVOKE INSERT ON public.registrations FROM authenticated;
