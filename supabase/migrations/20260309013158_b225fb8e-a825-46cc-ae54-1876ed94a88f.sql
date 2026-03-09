
-- Add detailed fraud indicators storage to creators
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS fraud_indicators jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS last_fraud_scan timestamp with time zone;

-- Add per-content fraud scoring
ALTER TABLE public.creator_content ADD COLUMN IF NOT EXISTS fraud_risk_score numeric DEFAULT 0;
ALTER TABLE public.creator_content ADD COLUMN IF NOT EXISTS fraud_indicators jsonb DEFAULT '[]'::jsonb;

-- Allow authenticated users to update creators (for fraud scan results via edge function)
CREATE POLICY "Authenticated users can update creators"
ON public.creators
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
