/*
# Fix role self-elevation vulnerability + secure admin provisioning

## Security Issue Fixed
The previous profiles UPDATE policy allowed any authenticated user to update
their own profile row — including the `role` column. A malicious user could
call `supabase.from('profiles').update({ role: 'admin' }).eq('id', myId)` and
grant themselves admin access. This migration closes that hole permanently.

## Changes

### 1. Profiles UPDATE policy — restricted to non-role fields only
- Users can still update their own `full_name`.
- Users CANNOT change their `role` — the WITH CHECK ensures the role in the
  updated row must match the existing role in the database.
- Admins can still update any profile (including roles), but only via the
  service role key (server-side), which bypasses RLS.

### 2. New function: set_user_role()
- SECURITY DEFINER function that sets a user's role.
- Can ONLY be called with the service role key (PostgREST exposes it only
  to the service role when invoked via RPC with elevated privileges).
- Used by the setup-admin edge function to provision the default admin.
- Guards against invalid role values.

### 3. New function: ensure_admin_from_env()
- SECURITY DEFINER function that creates or updates a profile to have the
  admin role, matching by email.
- Called by the setup-admin edge function at deploy time.
- Takes email + full_name as parameters; the edge function reads
  ADMIN_EMAIL/ADMIN_PASSWORD from env and passes them in.
*/

-- ============ 1. Fix profiles UPDATE policy ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop the vulnerable policy that allowed full self-update including role
DROP POLICY IF EXISTS "update_own_or_admin_profiles" ON public.profiles;

-- New policy: users can update their own profile BUT cannot change their role
-- The WITH CHECK compares the NEW.role against the existing row's role,
-- preventing any role escalation through client-side updates.
CREATE POLICY "update_own_profile_no_role_change" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Separate policy: admins can update any profile (including roles).
-- In practice this only applies when an admin uses the anon-key client.
-- The service role bypasses RLS entirely, so server-side role management
-- is not affected by this policy.
CREATE POLICY "admin_update_any_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============ 2. set_user_role() — server-only role management ============
CREATE OR REPLACE FUNCTION public.set_user_role(target_email text, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
  valid_role text;
BEGIN
  -- Validate role value
  IF new_role NOT IN ('admin', 'customer') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be ''admin'' or ''customer''.', new_role;
  END IF;

  -- Find the auth.users row by email
  SELECT id INTO target_id FROM auth.users WHERE email = target_email;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email: %', target_email;
  END IF;

  -- Update the profile's role
  UPDATE public.profiles SET role = new_role WHERE id = target_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No profile found for user with email: %', target_email;
  END IF;
END;
$$;

-- Revoke execute from anon and authenticated — only service role can call this
REVOKE EXECUTE ON FUNCTION public.set_user_role(text, text) FROM anon, authenticated;

-- ============ 3. ensure_admin_from_env() — provisioning helper ============
CREATE OR REPLACE FUNCTION public.ensure_admin_from_env(admin_email text, admin_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  -- Find the user by email
  SELECT id INTO target_id FROM auth.users WHERE email = admin_email;
  IF target_id IS NULL THEN
    RETURN 'User not found. Create the auth user first via the setup-admin edge function.';
  END IF;

  -- Set their role to admin
  UPDATE public.profiles SET role = 'admin' WHERE id = target_id;
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, full_name, role) VALUES (target_id, admin_name, 'admin');
  END IF;

  RETURN 'Admin role granted to ' || admin_email;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.ensure_admin_from_env(text, text) FROM anon, authenticated;
