-- Adiciona títulos editáveis para as seções de Missão e Visão
-- Usa IF NOT EXISTS para ser idempotente caso seja reaplicado
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS mission_title TEXT,
  ADD COLUMN IF NOT EXISTS vision_title TEXT;

-- Preenche o registro padrão com os valores atuais caso ainda estejam nulos
UPDATE public.site_settings
SET
  mission_title = COALESCE(mission_title, 'Nossa Missão'),
  vision_title  = COALESCE(vision_title,  'Nossa Visão')
WHERE id = 'default';
