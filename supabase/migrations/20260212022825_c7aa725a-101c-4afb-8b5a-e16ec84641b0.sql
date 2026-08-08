
-- Add status, role, and last_access columns to admin_users
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'master',
ADD COLUMN IF NOT EXISTS last_access timestamp with time zone;

-- Update existing admins to be active masters
UPDATE public.admin_users SET status = 'ativo', role = 'master' WHERE status = 'pendente';

-- Update create_admin_user function to set status as pendente
CREATE OR REPLACE FUNCTION public.create_admin_user(_email text, _password text, _name text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.admin_users (email, password_hash, name, status, role)
  VALUES (_email, extensions.crypt(_password, extensions.gen_salt('bf')), _name, 'pendente', 'master');
END;
$$;
