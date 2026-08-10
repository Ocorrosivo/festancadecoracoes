-- Adiciona colunas que o frontend envia mas não existiam na tabela
ALTER TABLE public.hero_banners
  ADD COLUMN IF NOT EXISTS tablet_image_url TEXT,
  ADD COLUMN IF NOT EXISTS secondary_button_text TEXT,
  ADD COLUMN IF NOT EXISTS secondary_button_link TEXT;
