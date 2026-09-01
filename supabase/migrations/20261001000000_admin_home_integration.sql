-- 1. Categorias
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_alt TEXT;

-- 2. FAQs
CREATE TABLE IF NOT EXISTS public.frequently_asked_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.frequently_asked_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read faqs" ON public.frequently_asked_questions;
CREATE POLICY "Allow public read faqs" ON public.frequently_asked_questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all faqs" ON public.frequently_asked_questions;
CREATE POLICY "Allow all faqs" ON public.frequently_asked_questions
  FOR ALL USING (auth.role() = 'authenticated' OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- 3. Nossa Arte em Detalhes
CREATE TABLE IF NOT EXISTS public.art_details_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  image_alt TEXT,
  title TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.art_details_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read art details" ON public.art_details_images;
CREATE POLICY "Allow public read art details" ON public.art_details_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all art details" ON public.art_details_images;
CREATE POLICY "Allow all art details" ON public.art_details_images
  FOR ALL USING (auth.role() = 'authenticated' OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
