
-- Drop restrictive policies on products table
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

-- Create permissive policies (admin auth is handled by edge functions)
CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Allow product insert"
ON public.products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow product update"
ON public.products FOR UPDATE
USING (true);

CREATE POLICY "Allow product delete"
ON public.products FOR DELETE
USING (true);

-- Fix storage policies for product-images bucket
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Public read for product images
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow all inserts to product-images (secured by edge function)
CREATE POLICY "Allow product image upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow all updates to product-images
CREATE POLICY "Allow product image update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- Allow all deletes from product-images
CREATE POLICY "Allow product image delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
