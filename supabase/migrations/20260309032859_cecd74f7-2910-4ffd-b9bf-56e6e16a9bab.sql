
-- 1. Brand Creator Ratings table
CREATE TABLE public.brand_creator_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  content_quality_rating integer CHECK (content_quality_rating >= 1 AND content_quality_rating <= 5),
  delivery_rating integer CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  professionalism_rating integer CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  review_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(brand_id, creator_id, campaign_id)
);

ALTER TABLE public.brand_creator_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands manage own ratings" ON public.brand_creator_ratings
  FOR ALL TO authenticated
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Public read ratings" ON public.brand_creator_ratings
  FOR SELECT TO authenticated USING (true);

-- 2. Add trust score columns to creators
ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS trust_score numeric DEFAULT 50,
  ADD COLUMN IF NOT EXISTS delivery_reliability numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contract_completion_rate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS audience_authenticity numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_campaigns_completed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS disputes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS price_range_min numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_range_max numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS portfolio_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_marketplace_listed boolean DEFAULT false;

-- 3. Conversion tracking table
CREATE TABLE public.conversion_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES public.creators(id) ON DELETE SET NULL,
  tracking_type text NOT NULL DEFAULT 'utm',
  tracking_code text NOT NULL,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  signups integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversion_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands manage own conversions" ON public.conversion_tracking
  FOR ALL TO authenticated
  USING (campaign_id IN (SELECT id FROM campaigns WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())))
  WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())));

-- 4. Content analysis table (AI analysis results)
CREATE TABLE public.content_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.creator_content(id) ON DELETE CASCADE,
  brand_exposure_score numeric DEFAULT 0,
  sentiment_score numeric DEFAULT 0,
  ad_compliance_score numeric DEFAULT 0,
  content_quality_score numeric DEFAULT 0,
  brand_safety_score numeric DEFAULT 0,
  product_visibility boolean DEFAULT false,
  brand_logo_seconds numeric DEFAULT 0,
  verbal_mentions integer DEFAULT 0,
  key_findings jsonb DEFAULT '[]',
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  model_used text
);

ALTER TABLE public.content_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands view content analysis" ON public.content_analysis
  FOR SELECT TO authenticated
  USING (content_id IN (
    SELECT cc.id FROM creator_content cc
    JOIN campaign_creators ccr ON cc.campaign_creator_id = ccr.id
    JOIN campaigns c ON ccr.campaign_id = c.id
    JOIN brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  ));

CREATE POLICY "Insert content analysis" ON public.content_analysis
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add conversion columns to campaigns
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS total_conversions integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_revenue numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpa numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS roas numeric DEFAULT 0;

-- Enable realtime for conversion tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversion_tracking;
