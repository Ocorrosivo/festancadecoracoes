
CREATE TABLE public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow the edge function (service role) to insert, public can't read
CREATE POLICY "No public access to newsletter_subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (false);
