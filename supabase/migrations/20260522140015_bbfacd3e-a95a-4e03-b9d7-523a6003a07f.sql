
-- 1. Lock down clients table (remove public access; all CRUD goes through edge function with service role)
DROP POLICY IF EXISTS "Admins can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can delete their own clients" ON public.clients;

CREATE POLICY "No direct access to clients"
  ON public.clients FOR ALL
  USING (false) WITH CHECK (false);

-- 2. Lock down product writes (keep public SELECT for catalog browsing)
DROP POLICY IF EXISTS "Allow product insert" ON public.products;
DROP POLICY IF EXISTS "Allow product update" ON public.products;
DROP POLICY IF EXISTS "Allow product delete" ON public.products;

-- "Products are viewable by everyone" (SELECT USING true) remains intentional public read.

-- 3. Lock down storage object writes on product-images (uploads go through edge function)
DROP POLICY IF EXISTS "Allow product image upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow product image update" ON storage.objects;
DROP POLICY IF EXISTS "Allow product image delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
-- Public read policies remain so the catalog can display images.

-- 4. Fix mutable search_path on existing admin auth helper functions
ALTER FUNCTION public.verify_admin_password(text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_admin_user(text, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_admin_password(text, text) SET search_path = public, pg_temp;
