
-- Drop the overly permissive policy - edge function will use service role key instead
DROP POLICY IF EXISTS "Authenticated users can update creators" ON public.creators;
