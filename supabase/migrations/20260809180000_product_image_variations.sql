-- Variações por imagem no produto
-- Mantém references legadas (price, sort_order) por compatibilidade,
-- mas estabelece campos canônicos: custom_price, ordem e nome_opcional.

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS custom_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS ordem integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nome_opcional text;

-- Backfill: preserva dados existentes das colunas legadas.
UPDATE public.product_images
SET custom_price = COALESCE(custom_price, price),
    ordem = COALESCE(NULLIF(ordem, 0), sort_order)
WHERE custom_price IS NULL
   OR ordem = 0;

-- Índice de ordenação canônica.
CREATE INDEX IF NOT EXISTS idx_product_images_product_ordem
  ON public.product_images(product_id, ordem);

-- Normaliza imagens principais duplicadas antes de aplicar a restrição:
-- mantém apenas a de menor ordem/created_at por produto.
UPDATE public.product_images pi
SET is_primary = false
WHERE pi.is_primary
  AND pi.id <> (
    SELECT inner_pi.id
    FROM public.product_images inner_pi
    WHERE inner_pi.product_id = pi.product_id
      AND inner_pi.is_primary
    ORDER BY inner_pi.ordem ASC, inner_pi.created_at ASC, inner_pi.id ASC
    LIMIT 1
  );

-- Garante no máximo uma imagem principal por produto.
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_one_primary
  ON public.product_images(product_id)
  WHERE is_primary;