-- Migration: RLS lockdown — remove escrita anônima de todas as tabelas
-- Contexto: as policies USING(true) FOR ALL deixavam o banco aberto à anon key
-- (pública no bundle). Toda escrita agora passa pelas Edge Functions com
-- service_role, que ignora RLS. Aqui restam apenas as leituras públicas
-- necessárias para o site funcionar sem autenticação.
-- Idempotente (segura para re-execução).

-- ─────────────────────────────────────────────
-- PRODUCTS: leitura pública, escrita só service_role
-- ─────────────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products service_role write" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Allow product insert" ON public.products;
DROP POLICY IF EXISTS "Allow product update" ON public.products;
DROP POLICY IF EXISTS "Allow product delete" ON public.products;

CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────
-- CATEGORIES: leitura pública, escrita só service_role (via admin-data)
-- ─────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all categories" ON public.categories;

CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────
-- HERO_BANNERS: leitura pública, escrita só service_role (via admin-data)
-- ─────────────────────────────────────────────
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read hero_banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Allow all hero_banners" ON public.hero_banners;

CREATE POLICY "hero_banners_public_read" ON public.hero_banners
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────
-- SITE_SETTINGS: leitura pública, escrita só service_role (via admin-data)
-- ─────────────────────────────────────────────
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public update site_settings" ON public.site_settings;

CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────
-- CLIENTS: nenhum acesso anônimo — só service_role (via admin-data)
-- ─────────────────────────────────────────────
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients service_role all" ON public.clients;
DROP POLICY IF EXISTS "Admins can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can delete their own clients" ON public.clients;
DROP POLICY IF EXISTS "No direct access to clients" ON public.clients;
-- (sem policies = nenhum acesso via anon/authenticated; service_role ignora RLS)

-- ─────────────────────────────────────────────
-- ADMIN_USERS: nenhum acesso anônimo (tabela legada)
-- ─────────────────────────────────────────────
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users service_role all" ON public.admin_users;
DROP POLICY IF EXISTS "No direct access to admin_users" ON public.admin_users;

-- ─────────────────────────────────────────────
-- PROFILES: nenhum acesso anônimo — auth/admin só via Edge Functions
-- (tabela criada no painel; garantir RLS ligado e sem policy permissiva)
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- BOOKINGS: nenhum acesso anônimo — só service_role (via admin-data)
-- (tabela criada no painel; garantir RLS ligado)
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    EXECUTE 'ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- NEWSLETTER_SUBSCRIBERS: inserção pública (formulário), sem leitura anônima
-- ─────────────────────────────────────────────
ALTER TABLE IF EXISTS public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Newsletter public insert" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Newsletter public select" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "No public access to newsletter_subscribers" ON public.newsletter_subscribers;

-- Inserção continua via Edge Function (service_role), mas mantemos insert
-- público como fallback caso o formulário chame direto. Leitura: nunca anônima.
CREATE POLICY "newsletter_public_insert" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────
-- STORAGE: leitura pública mantida; escrita só service_role (via Edge Function)
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Public Insert Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Storage" ON storage.objects;
DROP POLICY IF EXISTS "festanca_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "festanca_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "festanca_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow product image upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow product image update" ON storage.objects;
DROP POLICY IF EXISTS "Allow product image delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Leitura pública dos buckets (necessária para exibir imagens no site)
DROP POLICY IF EXISTS "Public Read Storage" ON storage.objects;
DROP POLICY IF EXISTS "festanca_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "product_images_select" ON storage.objects;

CREATE POLICY "storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('festanca-storage', 'product-images'));
