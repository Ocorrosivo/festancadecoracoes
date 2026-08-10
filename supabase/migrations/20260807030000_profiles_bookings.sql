-- Migration: profiles + bookings (arquitetura Auth nativa)
-- Contexto: o login admin usa Supabase Auth nativo e lê de public.profiles.
-- O histórico do cliente lê de public.bookings. Nenhuma migration criava
-- essas tabelas (existiam só no projeto antigo, feitas manualmente).
-- Idempotente.

-- ─────────────────────────────────────────────
-- PROFILES: espelha auth.users, guarda role/status/permissions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'Viewer',
  status TEXT NOT NULL DEFAULT 'Pendente',
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Sem policies para anon/authenticated: acesso só via service_role (Edge Functions).

-- Trigger: cria profile automaticamente ao registrar usuário no Auth,
-- lendo name/role/permissions do user_metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, status, permissions)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'Viewer'),
    'Pendente',
    COALESCE((NEW.raw_user_meta_data -> 'permissions')::jsonb, '{}'::jsonb)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- BOOKINGS: histórico de locações por cliente
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  price TEXT,
  status TEXT NOT NULL DEFAULT 'Agendado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- Sem policies para anon/authenticated: acesso só via service_role (Edge Functions).
