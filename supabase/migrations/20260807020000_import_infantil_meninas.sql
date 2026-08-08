-- Migration: Import 197 products - Infantil menina
-- Generated: 2026-08-07T23:10:11.207Z

-- Ensure admin user exists with correct password
-- (Re-seed using create_admin_user function)
SELECT public.create_admin_user('suprememidias.ok@gmail.com', '123', 'Admin Principal') WHERE NOT EXISTS (SELECT 1 FROM public.admin_users WHERE email = 'suprememidias.ok@gmail.com');
UPDATE public.admin_users SET status = 'ativo', role = 'master' WHERE email = 'suprememidias.ok@gmail.com';

-- Ensure category exists
INSERT INTO public.categories (name, slug, display_order, is_active)
VALUES ('Infantil menina', 'infantil-menina', 1, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert 197 products
INSERT INTO public.products (name, slug, category, price, description, image, trending) VALUES
  ('Painel Infantil Menina Florido', 'painel-infantil-menina-florido-001', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759742.webp', true),
  ('Decoração Jardim Encantado', 'decoracao-jardim-encantado-002', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759743.webp', true),
  ('Tema Princesa Real', 'tema-princesa-real-003', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759754.webp', true),
  ('Tema Bailarina Clássica', 'tema-bailarina-classica-004', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759755.webp', true),
  ('Tema Minnie Rosa', 'tema-minnie-rosa-005', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759756.webp', true),
  ('Tema Borboletas Coloridas', 'tema-borboletas-coloridas-006', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759757.webp', true),
  ('Tema Fazendinha Rosa', 'tema-fazendinha-rosa-007', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759758.webp', false),
  ('Tema Unicórnio Mágico', 'tema-unicornio-magico-008', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759759.webp', false),
  ('Tema Chuva de Amor', 'tema-chuva-de-amor-009', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759760.webp', false),
  ('Tema Alice no País das Maravilhas', 'tema-alice-no-pais-das-maravilhas-010', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759761.webp', false),
  ('Tema Sereia', 'tema-sereia-011', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759762.webp', false),
  ('Tema Fadas Encantadas', 'tema-fadas-encantadas-012', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759763.webp', false),
  ('Tema Arco-Íris', 'tema-arco-iris-013', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759764.webp', false),
  ('Tema Flores do Campo', 'tema-flores-do-campo-014', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759765.webp', false),
  ('Tema Coroa de Princesa', 'tema-coroa-de-princesa-015', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759766.webp', false),
  ('Tema Rapunzel', 'tema-rapunzel-016', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759767.webp', false),
  ('Tema Cinderela', 'tema-cinderela-017', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759768.webp', false),
  ('Tema Pequena Sereia', 'tema-pequena-sereia-018', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759769.webp', false),
  ('Tema Bela Adormecida', 'tema-bela-adormecida-019', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759770.webp', false),
  ('Tema Branca de Neve', 'tema-branca-de-neve-020', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759771.webp', false),
  ('Tema Frozen', 'tema-frozen-021', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759772.webp', false),
  ('Tema Moana', 'tema-moana-022', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759773.webp', false),
  ('Tema Encanto', 'tema-encanto-023', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759774.webp', false),
  ('Tema Vaiana', 'tema-vaiana-024', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759775.webp', false),
  ('Tema Peppa Pig', 'tema-peppa-pig-025', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759776.webp', false),
  ('Tema LOL Surprise', 'tema-lol-surprise-026', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759777.webp', false),
  ('Tema Barbie', 'tema-barbie-027', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759778.webp', false),
  ('Tema Coração Rosa', 'tema-coracao-rosa-028', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759779.webp', false),
  ('Tema Moranguinho', 'tema-moranguinho-029', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759780.webp', false),
  ('Tema Hello Kitty', 'tema-hello-kitty-030', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759781.webp', false),
  ('Tema Bichinhos da Floresta', 'tema-bichinhos-da-floresta-031', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759782.webp', false),
  ('Tema Flamingo', 'tema-flamingo-032', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759783.webp', false),
  ('Tema Balões Coloridos', 'tema-baloes-coloridos-033', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759784.webp', false),
  ('Tema Aquarela', 'tema-aquarela-034', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759785.webp', false),
  ('Tema Jardim das Flores', 'tema-jardim-das-flores-035', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759786.webp', false),
  ('Tema Gatinha Princesa', 'tema-gatinha-princesa-036', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759787.webp', false),
  ('Tema Coelhinha Rosa', 'tema-coelhinha-rosa-037', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759788.webp', false),
  ('Tema Pirulito Rosa', 'tema-pirulito-rosa-038', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759789.webp', false),
  ('Tema Doces e Guloseimas', 'tema-doces-e-guloseimas-039', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759790.webp', false),
  ('Tema Candy Colors', 'tema-candy-colors-040', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759791.webp', false),
  ('Tema Provençal Rosa', 'tema-provencal-rosa-041', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759792.webp', false),
  ('Tema Boho Chic Rosa', 'tema-boho-chic-rosa-042', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759793.webp', false),
  ('Tema Pétalas de Rosa', 'tema-petalas-de-rosa-043', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759794.webp', false),
  ('Tema Girassol Rosa', 'tema-girassol-rosa-044', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759795.webp', false),
  ('Tema Lavanda', 'tema-lavanda-045', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759796.webp', false),
  ('Tema Cerejeira', 'tema-cerejeira-046', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759797.webp', false),
  ('Tema Origami Rosa', 'tema-origami-rosa-047', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759798.webp', false),
  ('Tema Arabesco Rosa', 'tema-arabesco-rosa-048', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759799.webp', false),
  ('Tema Vitral Encantado', 'tema-vitral-encantado-049', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759803.webp', false),
  ('Tema Sonhos Dourados', 'tema-sonhos-dourados-050', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759804.webp', false),
  ('Decoração Infantil Menina 051', 'decoracao-infantil-menina-051-051', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759805.webp', false),
  ('Decoração Infantil Menina 052', 'decoracao-infantil-menina-052-052', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759806.webp', false),
  ('Decoração Infantil Menina 053', 'decoracao-infantil-menina-053-053', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759807.webp', false),
  ('Decoração Infantil Menina 054', 'decoracao-infantil-menina-054-054', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759808.webp', false),
  ('Decoração Infantil Menina 055', 'decoracao-infantil-menina-055-055', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759809.webp', false),
  ('Decoração Infantil Menina 056', 'decoracao-infantil-menina-056-056', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759810.webp', false),
  ('Decoração Infantil Menina 057', 'decoracao-infantil-menina-057-057', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759811.webp', false),
  ('Decoração Infantil Menina 058', 'decoracao-infantil-menina-058-058', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759816.webp', false),
  ('Decoração Infantil Menina 059', 'decoracao-infantil-menina-059-059', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759817.webp', false),
  ('Decoração Infantil Menina 060', 'decoracao-infantil-menina-060-060', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759818.webp', false),
  ('Decoração Infantil Menina 061', 'decoracao-infantil-menina-061-061', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759819.webp', false),
  ('Decoração Infantil Menina 062', 'decoracao-infantil-menina-062-062', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759820.webp', false),
  ('Decoração Infantil Menina 063', 'decoracao-infantil-menina-063-063', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759821.webp', false),
  ('Decoração Infantil Menina 064', 'decoracao-infantil-menina-064-064', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759822.webp', false),
  ('Decoração Infantil Menina 065', 'decoracao-infantil-menina-065-065', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759823.webp', false),
  ('Decoração Infantil Menina 066', 'decoracao-infantil-menina-066-066', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759824.webp', false),
  ('Decoração Infantil Menina 067', 'decoracao-infantil-menina-067-067', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759825.webp', false),
  ('Decoração Infantil Menina 068', 'decoracao-infantil-menina-068-068', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759826.webp', false),
  ('Decoração Infantil Menina 069', 'decoracao-infantil-menina-069-069', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759827.webp', false),
  ('Decoração Infantil Menina 070', 'decoracao-infantil-menina-070-070', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759828.webp', false),
  ('Decoração Infantil Menina 071', 'decoracao-infantil-menina-071-071', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759829.webp', false),
  ('Decoração Infantil Menina 072', 'decoracao-infantil-menina-072-072', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759830.webp', false),
  ('Decoração Infantil Menina 073', 'decoracao-infantil-menina-073-073', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759831.webp', false),
  ('Decoração Infantil Menina 074', 'decoracao-infantil-menina-074-074', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759833.webp', false),
  ('Decoração Infantil Menina 075', 'decoracao-infantil-menina-075-075', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759834.webp', false),
  ('Decoração Infantil Menina 076', 'decoracao-infantil-menina-076-076', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759835.webp', false),
  ('Decoração Infantil Menina 077', 'decoracao-infantil-menina-077-077', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759836.webp', false),
  ('Decoração Infantil Menina 078', 'decoracao-infantil-menina-078-078', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759837.webp', false),
  ('Decoração Infantil Menina 079', 'decoracao-infantil-menina-079-079', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759838.webp', false),
  ('Decoração Infantil Menina 080', 'decoracao-infantil-menina-080-080', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759839.webp', false),
  ('Decoração Infantil Menina 081', 'decoracao-infantil-menina-081-081', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759840.webp', false),
  ('Decoração Infantil Menina 082', 'decoracao-infantil-menina-082-082', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759841.webp', false),
  ('Decoração Infantil Menina 083', 'decoracao-infantil-menina-083-083', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759842.webp', false),
  ('Decoração Infantil Menina 084', 'decoracao-infantil-menina-084-084', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759843.webp', false),
  ('Decoração Infantil Menina 085', 'decoracao-infantil-menina-085-085', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759844.webp', false),
  ('Decoração Infantil Menina 086', 'decoracao-infantil-menina-086-086', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759845.webp', false),
  ('Decoração Infantil Menina 087', 'decoracao-infantil-menina-087-087', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759846.webp', false),
  ('Decoração Infantil Menina 088', 'decoracao-infantil-menina-088-088', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759847.webp', false),
  ('Decoração Infantil Menina 089', 'decoracao-infantil-menina-089-089', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759848.webp', false),
  ('Decoração Infantil Menina 090', 'decoracao-infantil-menina-090-090', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759849.webp', false),
  ('Decoração Infantil Menina 091', 'decoracao-infantil-menina-091-091', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759850.webp', false),
  ('Decoração Infantil Menina 092', 'decoracao-infantil-menina-092-092', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759851.webp', false),
  ('Decoração Infantil Menina 093', 'decoracao-infantil-menina-093-093', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759852.webp', false),
  ('Decoração Infantil Menina 094', 'decoracao-infantil-menina-094-094', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759853.webp', false),
  ('Decoração Infantil Menina 095', 'decoracao-infantil-menina-095-095', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759854.webp', false),
  ('Decoração Infantil Menina 096', 'decoracao-infantil-menina-096-096', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759855.webp', false),
  ('Decoração Infantil Menina 097', 'decoracao-infantil-menina-097-097', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759856.webp', false),
  ('Decoração Infantil Menina 098', 'decoracao-infantil-menina-098-098', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759857.webp', false),
  ('Decoração Infantil Menina 099', 'decoracao-infantil-menina-099-099', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759858.webp', false),
  ('Decoração Infantil Menina 100', 'decoracao-infantil-menina-100-100', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759859.webp', false),
  ('Decoração Infantil Menina 101', 'decoracao-infantil-menina-101-101', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759860.webp', false),
  ('Decoração Infantil Menina 102', 'decoracao-infantil-menina-102-102', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759861.webp', false),
  ('Decoração Infantil Menina 103', 'decoracao-infantil-menina-103-103', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759862.webp', false),
  ('Decoração Infantil Menina 104', 'decoracao-infantil-menina-104-104', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759863.webp', false),
  ('Decoração Infantil Menina 105', 'decoracao-infantil-menina-105-105', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759864.webp', false),
  ('Decoração Infantil Menina 106', 'decoracao-infantil-menina-106-106', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759865.webp', false),
  ('Decoração Infantil Menina 107', 'decoracao-infantil-menina-107-107', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759866.webp', false),
  ('Decoração Infantil Menina 108', 'decoracao-infantil-menina-108-108', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759867.webp', false),
  ('Decoração Infantil Menina 109', 'decoracao-infantil-menina-109-109', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759868.webp', false),
  ('Decoração Infantil Menina 110', 'decoracao-infantil-menina-110-110', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759869.webp', false),
  ('Decoração Infantil Menina 111', 'decoracao-infantil-menina-111-111', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759870.webp', false),
  ('Decoração Infantil Menina 112', 'decoracao-infantil-menina-112-112', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759871.webp', false),
  ('Decoração Infantil Menina 113', 'decoracao-infantil-menina-113-113', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759872.webp', false),
  ('Decoração Infantil Menina 114', 'decoracao-infantil-menina-114-114', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759873.webp', false),
  ('Decoração Infantil Menina 115', 'decoracao-infantil-menina-115-115', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759874.webp', false),
  ('Decoração Infantil Menina 116', 'decoracao-infantil-menina-116-116', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759916.webp', false),
  ('Decoração Infantil Menina 117', 'decoracao-infantil-menina-117-117', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759917.webp', false),
  ('Decoração Infantil Menina 118', 'decoracao-infantil-menina-118-118', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759918.webp', false),
  ('Decoração Infantil Menina 119', 'decoracao-infantil-menina-119-119', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759919.webp', false),
  ('Decoração Infantil Menina 120', 'decoracao-infantil-menina-120-120', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759920.webp', false),
  ('Decoração Infantil Menina 121', 'decoracao-infantil-menina-121-121', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759921.webp', false),
  ('Decoração Infantil Menina 122', 'decoracao-infantil-menina-122-122', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759922.webp', false),
  ('Decoração Infantil Menina 123', 'decoracao-infantil-menina-123-123', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759923.webp', false),
  ('Decoração Infantil Menina 124', 'decoracao-infantil-menina-124-124', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759924.webp', false),
  ('Decoração Infantil Menina 125', 'decoracao-infantil-menina-125-125', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759925.webp', false),
  ('Decoração Infantil Menina 126', 'decoracao-infantil-menina-126-126', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759926.webp', false),
  ('Decoração Infantil Menina 127', 'decoracao-infantil-menina-127-127', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759927.webp', false),
  ('Decoração Infantil Menina 128', 'decoracao-infantil-menina-128-128', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759928.webp', false),
  ('Decoração Infantil Menina 129', 'decoracao-infantil-menina-129-129', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759929.webp', false),
  ('Decoração Infantil Menina 130', 'decoracao-infantil-menina-130-130', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759930.webp', false),
  ('Decoração Infantil Menina 131', 'decoracao-infantil-menina-131-131', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759931.webp', false),
  ('Decoração Infantil Menina 132', 'decoracao-infantil-menina-132-132', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759932.webp', false),
  ('Decoração Infantil Menina 133', 'decoracao-infantil-menina-133-133', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759933.webp', false),
  ('Decoração Infantil Menina 134', 'decoracao-infantil-menina-134-134', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759934.webp', false),
  ('Decoração Infantil Menina 135', 'decoracao-infantil-menina-135-135', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759935.webp', false),
  ('Decoração Infantil Menina 136', 'decoracao-infantil-menina-136-136', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759936.webp', false),
  ('Decoração Infantil Menina 137', 'decoracao-infantil-menina-137-137', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759937.webp', false),
  ('Decoração Infantil Menina 138', 'decoracao-infantil-menina-138-138', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759938.webp', false),
  ('Decoração Infantil Menina 139', 'decoracao-infantil-menina-139-139', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759939.webp', false),
  ('Decoração Infantil Menina 140', 'decoracao-infantil-menina-140-140', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759940.webp', false),
  ('Decoração Infantil Menina 141', 'decoracao-infantil-menina-141-141', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759941.webp', false),
  ('Decoração Infantil Menina 142', 'decoracao-infantil-menina-142-142', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759942.webp', false),
  ('Decoração Infantil Menina 143', 'decoracao-infantil-menina-143-143', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759943.webp', false),
  ('Decoração Infantil Menina 144', 'decoracao-infantil-menina-144-144', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759944.webp', false),
  ('Decoração Infantil Menina 145', 'decoracao-infantil-menina-145-145', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759945.webp', false),
  ('Decoração Infantil Menina 146', 'decoracao-infantil-menina-146-146', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759946.webp', false),
  ('Decoração Infantil Menina 147', 'decoracao-infantil-menina-147-147', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759947.webp', false),
  ('Decoração Infantil Menina 148', 'decoracao-infantil-menina-148-148', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759948.webp', false),
  ('Decoração Infantil Menina 149', 'decoracao-infantil-menina-149-149', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759949.webp', false),
  ('Decoração Infantil Menina 150', 'decoracao-infantil-menina-150-150', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759950.webp', false),
  ('Decoração Infantil Menina 151', 'decoracao-infantil-menina-151-151', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759951.webp', false),
  ('Decoração Infantil Menina 152', 'decoracao-infantil-menina-152-152', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759952.webp', false),
  ('Decoração Infantil Menina 153', 'decoracao-infantil-menina-153-153', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759953.webp', false),
  ('Decoração Infantil Menina 154', 'decoracao-infantil-menina-154-154', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759954.webp', false),
  ('Decoração Infantil Menina 155', 'decoracao-infantil-menina-155-155', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759955.webp', false),
  ('Decoração Infantil Menina 156', 'decoracao-infantil-menina-156-156', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759956.webp', false),
  ('Decoração Infantil Menina 157', 'decoracao-infantil-menina-157-157', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759957.webp', false),
  ('Decoração Infantil Menina 158', 'decoracao-infantil-menina-158-158', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759958.webp', false),
  ('Decoração Infantil Menina 159', 'decoracao-infantil-menina-159-159', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759959.webp', false),
  ('Decoração Infantil Menina 160', 'decoracao-infantil-menina-160-160', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759960.webp', false),
  ('Decoração Infantil Menina 161', 'decoracao-infantil-menina-161-161', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759961.webp', false),
  ('Decoração Infantil Menina 162', 'decoracao-infantil-menina-162-162', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759962.webp', false),
  ('Decoração Infantil Menina 163', 'decoracao-infantil-menina-163-163', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759963.webp', false),
  ('Decoração Infantil Menina 164', 'decoracao-infantil-menina-164-164', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759964.webp', false),
  ('Decoração Infantil Menina 165', 'decoracao-infantil-menina-165-165', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759965.webp', false),
  ('Decoração Infantil Menina 166', 'decoracao-infantil-menina-166-166', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759966.webp', false),
  ('Decoração Infantil Menina 167', 'decoracao-infantil-menina-167-167', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759967.webp', false),
  ('Decoração Infantil Menina 168', 'decoracao-infantil-menina-168-168', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759968.webp', false),
  ('Decoração Infantil Menina 169', 'decoracao-infantil-menina-169-169', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759969.webp', false),
  ('Decoração Infantil Menina 170', 'decoracao-infantil-menina-170-170', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759970.webp', false),
  ('Decoração Infantil Menina 171', 'decoracao-infantil-menina-171-171', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759971.webp', false),
  ('Decoração Infantil Menina 172', 'decoracao-infantil-menina-172-172', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759972.webp', false),
  ('Decoração Infantil Menina 173', 'decoracao-infantil-menina-173-173', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759973.webp', false),
  ('Decoração Infantil Menina 174', 'decoracao-infantil-menina-174-174', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759974.webp', false),
  ('Decoração Infantil Menina 175', 'decoracao-infantil-menina-175-175', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759975.webp', false),
  ('Decoração Infantil Menina 176', 'decoracao-infantil-menina-176-176', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759976.webp', false),
  ('Decoração Infantil Menina 177', 'decoracao-infantil-menina-177-177', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759977.webp', false),
  ('Decoração Infantil Menina 178', 'decoracao-infantil-menina-178-178', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759978.webp', false),
  ('Decoração Infantil Menina 179', 'decoracao-infantil-menina-179-179', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759979.webp', false),
  ('Decoração Infantil Menina 180', 'decoracao-infantil-menina-180-180', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759980.webp', false),
  ('Decoração Infantil Menina 181', 'decoracao-infantil-menina-181-181', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759981.webp', false),
  ('Decoração Infantil Menina 182', 'decoracao-infantil-menina-182-182', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759982.webp', false),
  ('Decoração Infantil Menina 183', 'decoracao-infantil-menina-183-183', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759983.webp', false),
  ('Decoração Infantil Menina 184', 'decoracao-infantil-menina-184-184', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759984.webp', false),
  ('Decoração Infantil Menina 185', 'decoracao-infantil-menina-185-185', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759985.webp', false),
  ('Decoração Infantil Menina 186', 'decoracao-infantil-menina-186-186', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759986.webp', false),
  ('Decoração Infantil Menina 187', 'decoracao-infantil-menina-187-187', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759987.webp', false),
  ('Decoração Infantil Menina 188', 'decoracao-infantil-menina-188-188', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759988.webp', false),
  ('Decoração Infantil Menina 189', 'decoracao-infantil-menina-189-189', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759989.webp', false),
  ('Decoração Infantil Menina 190', 'decoracao-infantil-menina-190-190', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759990.webp', false),
  ('Decoração Infantil Menina 191', 'decoracao-infantil-menina-191-191', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759991.webp', false),
  ('Decoração Infantil Menina 192', 'decoracao-infantil-menina-192-192', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759992.webp', false),
  ('Decoração Infantil Menina 193', 'decoracao-infantil-menina-193-193', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759993.webp', false),
  ('Decoração Infantil Menina 194', 'decoracao-infantil-menina-194-194', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759994.webp', false),
  ('Decoração Infantil Menina 195', 'decoracao-infantil-menina-195-195', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759995.webp', false),
  ('Decoração Infantil Menina 196', 'decoracao-infantil-menina-196-196', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759996.webp', false),
  ('Decoração Infantil Menina 197', 'decoracao-infantil-menina-197-197', 'Infantil menina', 'R$ 0,00', 'Linda decoração para festas infantis.

Consulte disponibilidade, datas e demais informações entrando em contato pelo WhatsApp.

As imagens são ilustrativas e poderão sofrer pequenas variações conforme a montagem.', '/produtos/infantil-meninas/759997.webp', false)
ON CONFLICT (slug) DO NOTHING;
