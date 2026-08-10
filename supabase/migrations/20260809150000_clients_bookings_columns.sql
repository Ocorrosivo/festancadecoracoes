-- Migration to add missing columns for better client management

-- Add 'observacoes' and 'origem' to clients
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS observacoes text,
ADD COLUMN IF NOT EXISTS origem varchar(255) DEFAULT 'Site';

-- Add 'horario' and 'observacoes' to bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS horario varchar(50),
ADD COLUMN IF NOT EXISTS observacoes text;

-- Update RLS policies to allow inserting these new columns (not strictly necessary for columns unless specifically restricted, but good practice if views depend on them)

-- We should also ensure the Edge function has permission to insert/update these. The edge function uses SERVICE_ROLE_KEY, so it bypasses RLS.
