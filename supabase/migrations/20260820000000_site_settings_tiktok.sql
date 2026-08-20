-- Adiciona a coluna tiktok que o frontend envia mas não existia na tabela.
-- O AdminSettings envia `tiktok` no payload de upsert; sem a coluna, o
-- INSERT/UPDATE estourava "column tiktok does not exist" e a Edge Function
-- devolvia 500, exibindo apenas "Erro ao salvar configurações." no painel.
-- Mesmo padrão da correção de hero_banners_missing_columns.
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS tiktok TEXT;
