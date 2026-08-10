-- Altera coluna date de timestamptz para TEXT para aceitar datas formatadas do frontend
ALTER TABLE public.bookings ALTER COLUMN date TYPE TEXT USING date::text;
ALTER TABLE public.bookings ALTER COLUMN date SET DEFAULT '';
