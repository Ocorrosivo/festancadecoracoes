-- Migration: Full Refactor Tables & Storage (Idempotent)
-- Safe idempotent table creation and initial seed data

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  logo_url TEXT,
  favicon_url TEXT,
  site_name TEXT DEFAULT 'Festança Decorações',
  description TEXT DEFAULT 'Decorações completas para festas infantis, 15 anos, casamentos e eventos especiais.',
  primary_color TEXT DEFAULT '#ff4f9a',
  secondary_color TEXT DEFAULT '#111827',
  whatsapp TEXT DEFAULT '5511999999999',
  phone TEXT DEFAULT '(11) 99999-9999',
  instagram TEXT DEFAULT 'https://instagram.com',
  facebook TEXT DEFAULT 'https://facebook.com',
  address TEXT DEFAULT 'São Paulo - SP',
  footer_text TEXT DEFAULT 'Festança Decorações. Todos os direitos reservados.',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
CREATE POLICY "Allow public read site_settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update site_settings" ON public.site_settings;
CREATE POLICY "Allow public update site_settings" ON public.site_settings
  FOR ALL USING (true);

-- Seed default site_settings
INSERT INTO public.site_settings (id, site_name, description)
VALUES ('default', 'Festança Decorações', 'Decorações completas para festas infantis, 15 anos, casamentos e eventos especiais.')
ON CONFLICT (id) DO NOTHING;

-- 2. Hero Banners Table
CREATE TABLE IF NOT EXISTS public.hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  badge_text TEXT DEFAULT '✨ Você sonha, nós realizamos',
  title TEXT DEFAULT 'Festança Decorações',
  subtitle TEXT DEFAULT 'Momentos Mágicos, Memórias Inesquecíveis',
  description TEXT DEFAULT 'Decorações completas para festas infantis, 15 anos, casamentos e eventos especiais.',
  button_text TEXT DEFAULT 'Ver Catálogo',
  button_link TEXT DEFAULT '/produtos',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for hero_banners
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read hero_banners" ON public.hero_banners;
CREATE POLICY "Allow public read hero_banners" ON public.hero_banners
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all hero_banners" ON public.hero_banners;
CREATE POLICY "Allow all hero_banners" ON public.hero_banners
  FOR ALL USING (true);

-- Seed default active hero_banner
INSERT INTO public.hero_banners (badge_text, title, subtitle, description, button_text, button_link, is_active)
SELECT '✨ Você sonha, nós realizamos', 'Festança Decorações', 'Momentos Mágicos, Memórias Inesquecíveis', 'Decorações completas para festas infantis, 15 anos, casamentos e eventos especiais.', 'Ver Catálogo', '/produtos', true
WHERE NOT EXISTS (SELECT 1 FROM public.hero_banners);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all categories" ON public.categories;
CREATE POLICY "Allow all categories" ON public.categories
  FOR ALL USING (true);

-- Seed default categories
INSERT INTO public.categories (name, slug, display_order, is_active) VALUES
('Infantil menina', 'infantil-menina', 1, true),
('Infantil menino', 'infantil-menino', 2, true),
('Chá de bebê', 'cha-de-bebe', 3, true),
('Chá revelação', 'cha-revelacao', 4, true),
('15 anos', '15-anos', 5, true),
('Formatura', 'formatura', 6, true),
('Casamento', 'casamento', 7, true),
('Chá de casa nova', 'cha-de-casa-nova', 8, true),
('Feminina', 'feminina', 9, true),
('Masculina', 'masculina', 10, true),
('Brinquedos', 'brinquedos', 11, true)
ON CONFLICT (name) DO NOTHING;

-- 4. Ensure Storage Buckets Exist for Public Uploads (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('festanca-storage', 'festanca-storage', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (idempotent via DROP IF EXISTS)
DROP POLICY IF EXISTS "Public Read Storage" ON storage.objects;
CREATE POLICY "Public Read Storage" ON storage.objects
  FOR SELECT USING (bucket_id IN ('festanca-storage', 'product-images'));

DROP POLICY IF EXISTS "Public Insert Storage" ON storage.objects;
CREATE POLICY "Public Insert Storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('festanca-storage', 'product-images'));

DROP POLICY IF EXISTS "Public Update Storage" ON storage.objects;
CREATE POLICY "Public Update Storage" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('festanca-storage', 'product-images'));

DROP POLICY IF EXISTS "Public Delete Storage" ON storage.objects;
CREATE POLICY "Public Delete Storage" ON storage.objects
  FOR DELETE USING (bucket_id IN ('festanca-storage', 'product-images'));
