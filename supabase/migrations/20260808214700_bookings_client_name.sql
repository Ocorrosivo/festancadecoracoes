-- Adiciona client_name para bookings feitos pelo site público (sem client_id)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS client_name TEXT;
