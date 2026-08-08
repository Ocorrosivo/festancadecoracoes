
-- Function to verify admin password using extensions schema
CREATE OR REPLACE FUNCTION public.verify_admin_password(_email text, _password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = _email
      AND password_hash = extensions.crypt(_password, password_hash)
  );
$$;

-- Function to create admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(_email text, _password text, _name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.admin_users (email, password_hash, name)
  VALUES (_email, extensions.crypt(_password, extensions.gen_salt('bf')), _name);
END;
$$;

-- Function to update admin password
CREATE OR REPLACE FUNCTION public.update_admin_password(_email text, _password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.admin_users
  SET password_hash = extensions.crypt(_password, extensions.gen_salt('bf'))
  WHERE email = _email;
END;
$$;
