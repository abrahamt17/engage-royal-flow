CREATE POLICY "Authenticated users can create creators"
ON public.creators
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

GRANT INSERT ON TABLE public.creators TO authenticated;
