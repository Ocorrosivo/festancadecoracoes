ALTER TABLE public.site_settings
ADD COLUMN about_header_image TEXT,
ADD COLUMN about_header_badge TEXT,
ADD COLUMN about_header_title_1 TEXT,
ADD COLUMN about_header_title_2 TEXT,
ADD COLUMN about_mission TEXT,
ADD COLUMN about_vision TEXT,
ADD COLUMN about_features JSONB,
ADD COLUMN about_stats JSONB;

-- Injeção de Segurança (Idempotente):
UPDATE public.site_settings
SET 
  about_header_badge = COALESCE(about_header_badge, 'Nossa História'),
  about_header_title_1 = COALESCE(about_header_title_1, 'Sobre a'),
  about_header_title_2 = COALESCE(about_header_title_2, 'Festança'),
  about_mission = COALESCE(about_mission, 'Democratizar o acesso a decorações de eventos premium através do aluguel. Acreditamos que todos merecem celebrar com sofisticação, sem comprometer o orçamento.'),
  about_vision = COALESCE(about_vision, 'Ser a referência em locação de decoração para eventos no Brasil, reconhecida pela qualidade, inovação e excelência no atendimento.'),
  about_features = COALESCE(about_features, '[
    {"id": "feat1", "icon": "Heart", "title": "Feito com Amor", "desc": "Cada detalhe é pensado com carinho para tornar seu evento único e inesquecível.", "active": true, "order": 1},
    {"id": "feat2", "icon": "Award", "title": "Qualidade Premium", "desc": "Trabalhamos apenas com materiais de alta qualidade para garantir elegância em cada peça.", "active": true, "order": 2},
    {"id": "feat3", "icon": "Users", "title": "Atendimento Personalizado", "desc": "Nossa equipe está pronta para entender suas necessidades e criar o cenário perfeito.", "active": true, "order": 3},
    {"id": "feat4", "icon": "Sparkles", "title": "Criatividade Sem Limites", "desc": "Transformamos ideias em realidade com temas exclusivos e decorações originais.", "active": true, "order": 4}
  ]'),
  about_stats = COALESCE(about_stats, '[
    {"id": "stat1", "value": "5600", "suffix": "+", "label": "Eventos Realizados", "active": true, "order": 1},
    {"id": "stat2", "value": "200", "suffix": "+", "label": "Peças no Catálogo", "active": true, "order": 2},
    {"id": "stat3", "value": "98", "suffix": "%", "label": "Clientes Satisfeitos", "active": true, "order": 3},
    {"id": "stat4", "value": "4", "suffix": "+", "label": "Anos de Experiência", "active": true, "order": 4}
  ]')
WHERE id = 'default';
