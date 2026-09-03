-- Add about_text column to site_settings for the "Quem Somos" section
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS about_text TEXT;
