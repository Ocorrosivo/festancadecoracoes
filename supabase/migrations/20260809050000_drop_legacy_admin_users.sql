-- ─────────────────────────────────────────────
-- Remoção do legado admin_users
-- ─────────────────────────────────────────────
-- Contexto: a autenticação migrou 100% para Supabase Auth + public.profiles.
-- As Edge Functions (admin-auth, admin-data, upload-product-image) validam via
-- supabase.auth.getUser(token); nenhuma consulta admin_users.
--
-- Pré-condições verificadas no projeto pzqrqsqggvawbbhgpbbx em 2026-08-09:
--   - public.clients: 0 linhas, 0 valores em admin_id (FK sem dados)
--   - public.admin_users: 1 linha legada (suprememidias.ok@gmail.com)
--   - Nenhuma policy em public.* referencia admin_users
--   - profiles já contém os dois admins ativos (role Master)

-- 1. Remover a FK de clients para a tabela legada.
--    admin_id passa a referenciar profiles (dono do registro).
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_admin_id_fkey;

ALTER TABLE public.clients
  ADD CONSTRAINT clients_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Remover funções legadas de senha (bcrypt manual, substituído por Supabase Auth).
DROP FUNCTION IF EXISTS public.verify_admin_password(text, text);
DROP FUNCTION IF EXISTS public.create_admin_user(text, text, text);

-- 3. Remover a tabela legada (CASCADE cobre índices e a self-FK created_by).
DROP TABLE IF EXISTS public.admin_users CASCADE;
