
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  dimensions TEXT,
  trending BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access (products are visible to everyone)
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (true);

-- Admin write access (for now, allow all authenticated users to manage products)
CREATE POLICY "Authenticated users can insert products"
ON public.products FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete products"
ON public.products FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with default products
INSERT INTO public.products (name, slug, category, price, description, dimensions, trending, image) VALUES
('Arco Floral Royal', 'arco-floral-royal', 'Casamento', 'R$ 299,00', 'Um magnífico arco floral composto por rosas premium e folhagens preservadas. Ideal para cerimônias de casamento clássicas e elegantes.', '2.5m x 2.2m', true, '/placeholder.svg'),
('Conjunto Sonho Pastel', 'conjunto-sonho-pastel', 'Menina', 'R$ 149,00', 'Conjunto delicado em tons pastéis com balões, flores e detalhes encantadores para festas infantis.', '1.8m x 1.5m', false, '/placeholder.svg'),
('Setup Piquenique Boho', 'setup-piquenique-boho', 'Eventos Sociais', 'R$ 185,00', 'Setup completo para piquenique ao ar livre com estilo boho chic, incluindo almofadas, tapetes e arranjos naturais.', '3.0m x 2.0m', false, '/placeholder.svg'),
('Baby Boy Voyage', 'baby-boy-voyage', 'Menino', 'R$ 159,00', 'Decoração temática de viagem para chá de bebê ou aniversário de menino, com balões e detalhes em azul e branco.', '2.0m x 1.8m', false, '/placeholder.svg'),
('Gala Ouro & Branco', 'gala-ouro-branco', 'Formatura', 'R$ 210,00', 'Decoração sofisticada em dourado e branco para formaturas e eventos de gala, com lustres e arranjos florais.', '3.0m x 2.5m', false, '/placeholder.svg'),
('Jardim Encantado', 'jardim-encantado', 'Ao Ar Livre', 'R$ 345,00', 'Cenário mágico de jardim encantado com arcos florais, luzes e elementos naturais para eventos ao ar livre.', '4.0m x 3.0m', false, '/placeholder.svg');
