
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===================== BRANDS =====================
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  default_base_pay NUMERIC DEFAULT 500,
  performance_multiplier NUMERIC DEFAULT 2.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own brand" ON public.brands FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== CREATORS =====================
CREATE TABLE public.creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  category TEXT,
  follower_count INTEGER DEFAULT 0,
  avg_engagement_rate NUMERIC DEFAULT 0,
  audience_demographics JSONB DEFAULT '{}',
  fraud_risk_score NUMERIC DEFAULT 0 CHECK (fraud_risk_score >= 0 AND fraud_risk_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators readable by authenticated" ON public.creators FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON public.creators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== CAMPAIGNS =====================
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');

CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status public.campaign_status NOT NULL DEFAULT 'draft',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  content_type TEXT DEFAULT 'video',
  budget NUMERIC NOT NULL DEFAULT 0,
  spent NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  target_audience JSONB DEFAULT '{}',
  payroll_formula JSONB DEFAULT '{"base_pay": 500, "performance_multiplier": 2.5, "conversion_bonus": 0, "audience_match_weight": 1.0}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands manage own campaigns" ON public.campaigns FOR ALL
  USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== CAMPAIGN_CREATORS =====================
CREATE TABLE public.campaign_creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'invited',
  base_pay NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, creator_id)
);
ALTER TABLE public.campaign_creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands manage campaign creators" ON public.campaign_creators FOR ALL
  USING (campaign_id IN (SELECT id FROM public.campaigns WHERE brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())))
  WITH CHECK (campaign_id IN (SELECT id FROM public.campaigns WHERE brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())));
CREATE TRIGGER update_campaign_creators_updated_at BEFORE UPDATE ON public.campaign_creators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================== CREATOR_CONTENT =====================
CREATE TABLE public.creator_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_creator_id UUID NOT NULL REFERENCES public.campaign_creators(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content_url TEXT,
  views INTEGER DEFAULT 0,
  watch_time_pct NUMERIC DEFAULT 0,
  completion_rate NUMERIC DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  performance_score NUMERIC DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 1),
  audience_match_score NUMERIC DEFAULT 0 CHECK (audience_match_score >= 0 AND audience_match_score <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.creator_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands view campaign content" ON public.creator_content FOR SELECT TO authenticated
  USING (campaign_creator_id IN (
    SELECT cc.id FROM public.campaign_creators cc
    JOIN public.campaigns c ON cc.campaign_id = c.id
    JOIN public.brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- ===================== PAYROLL =====================
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'flagged');

CREATE TABLE public.payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_creator_id UUID NOT NULL REFERENCES public.campaign_creators(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.creator_content(id),
  base_pay NUMERIC NOT NULL DEFAULT 0,
  perf_score NUMERIC NOT NULL DEFAULT 0,
  match_score NUMERIC NOT NULL DEFAULT 0,
  multiplier NUMERIC NOT NULL DEFAULT 1,
  bonus NUMERIC NOT NULL DEFAULT 0,
  total_payment NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status public.payout_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands view payroll" ON public.payroll FOR SELECT TO authenticated
  USING (campaign_creator_id IN (
    SELECT cc.id FROM public.campaign_creators cc
    JOIN public.campaigns c ON cc.campaign_id = c.id
    JOIN public.brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- ===================== INDEXES =====================
CREATE INDEX idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaign_creators_campaign ON public.campaign_creators(campaign_id);
CREATE INDEX idx_campaign_creators_creator ON public.campaign_creators(creator_id);
CREATE INDEX idx_creator_content_campaign_creator ON public.creator_content(campaign_creator_id);
CREATE INDEX idx_payroll_campaign_creator ON public.payroll(campaign_creator_id);
CREATE INDEX idx_payroll_status ON public.payroll(status);
CREATE INDEX idx_creators_fraud_risk ON public.creators(fraud_risk_score);
