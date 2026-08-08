
-- Create admin_users table
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.admin_users(id)
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read admin_users (for login verification we'll use edge function)
CREATE POLICY "No direct access to admin_users"
ON public.admin_users
FOR ALL
USING (false);

-- Create extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert the initial admin user with hashed password
INSERT INTO public.admin_users (email, password_hash, name)
VALUES ('suprememidias.ok@gmail.com', crypt('123', gen_salt('bf')), 'Admin Principal');
