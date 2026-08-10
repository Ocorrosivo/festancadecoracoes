-- Tabela de imagens múltiplas por produto
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  price numeric(10,2),
  is_primary boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Mesma política de leitura pública que products
CREATE POLICY product_images_public_read ON public.product_images
  FOR SELECT TO public USING (true);
