-- Allow authenticated users to insert/update creator payment profiles (for brands managing their creators)
CREATE POLICY "Brands can insert creator payment profiles" ON public.creator_payment_profiles
  FOR INSERT TO authenticated
  WITH CHECK (creator_id IN (
    SELECT cc.creator_id FROM campaign_creators cc
    JOIN campaigns c ON cc.campaign_id = c.id
    JOIN brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  ));

CREATE POLICY "Brands can update creator payment profiles" ON public.creator_payment_profiles
  FOR UPDATE TO authenticated
  USING (creator_id IN (
    SELECT cc.creator_id FROM campaign_creators cc
    JOIN campaigns c ON cc.campaign_id = c.id
    JOIN brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;