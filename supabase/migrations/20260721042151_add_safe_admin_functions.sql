-- Safe function to check if any admin exists (callable without authentication)
-- Used by the login page to decide whether to show bootstrap or signin
CREATE OR REPLACE FUNCTION public.any_admin_exists()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1);
$$;

GRANT EXECUTE ON FUNCTION public.any_admin_exists() TO anon, authenticated;

-- Safe function to list all admin accounts (email + role only, no sensitive data)
-- Callable by authenticated users who are themselves admins
CREATE OR REPLACE FUNCTION public.list_admin_accounts()
RETURNS TABLE (id UUID, user_id UUID, role TEXT, email TEXT, created_at TIMESTAMPTZ)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.id, ur.user_id, ur.role::TEXT, u.email, ur.created_at
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  ORDER BY ur.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.list_admin_accounts() TO authenticated;
