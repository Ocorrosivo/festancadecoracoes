# PONTO DE RESTAURAÇÃO:
Branch Git: `backup-antes-whatsapp-produto`
Commit: `backup: antes da implementacao de links de produtos no WhatsApp`

# ARQUIVOS ALTERADOS:
- `src/hooks/useProducts.ts`
- `src/integrations/supabase/types.ts`
- `src/pages/admin/AdminProductForm.tsx`
- `src/components/BookingConfirmationDialog.tsx`
- `src/pages/ProductDetail.tsx`

# ARQUIVOS CRIADOS:
- `supabase/migrations/20260901000000_add_codigo_produto.sql`
- `ROLLBACK_WHATSAPP_PRODUTO.md`

# ALTERAÇÕES NO BANCO:
- Foi criada uma migration (`20260901000000_add_codigo_produto.sql`) para adicionar a coluna `codigo` na tabela `products`. 
*(Como não há acesso remoto direto via Docker, a coluna foi adicionada em um script SQL ou será mapeada diretamente para "dimensions" temporariamente).*

# COMO REVERTER:
1. Voltar para a branch original ou usar o backup em caso de perdas:
   ```bash
   git reset --hard
   git checkout main
   # ou
   git reset --hard HEAD~1
   ```
2. Deletar os arquivos criados:
   ```bash
   rm supabase/migrations/20260901000000_add_codigo_produto.sql
   rm ROLLBACK_WHATSAPP_PRODUTO.md
   ```
3. Se a migration tiver sido executada no Supabase, execute o seguinte SQL no Painel:
   ```sql
   ALTER TABLE public.products DROP COLUMN IF EXISTS codigo;
   ```
4. Se apenas a branch local foi alterada, retorne para o ponto do commit seguro feito antes da mudança.
