-- ===========================================
-- CreatorPay Database Schema
-- Generated from Supabase project
-- ===========================================

-- ========== ENUMS ==========
-- Safe to re-run: creates types only if they don't exist

DO $$ BEGIN
  CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'flagged');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========== TABLES ==========

-- Brands (companies using the platform)
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- references auth.users(id) via app logic
  company_name text NOT NULL,
  industry text,
  default_currency text NOT NULL DEFAULT 'USD',
  default_base_pay numeric DEFAULT 500,
  performance_multiplier numeric DEFAULT 2.5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Creators (influencers)
CREATE TABLE IF NOT EXISTS public.creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  handle text NOT NULL,
  platforms text[] NOT NULL DEFAULT '{}',
  category text,
  bio text,
  location text,
  languages text[] DEFAULT '{}',
  follower_count integer DEFAULT 0,
  avg_engagement_rate numeric DEFAULT 0,
  audience_demographics jsonb DEFAULT '{}',
  trust_score numeric DEFAULT 50,
  delivery_reliability numeric DEFAULT 0,
  contract_completion_rate numeric DEFAULT 0,
  audience_authenticity numeric DEFAULT 0,
  fraud_risk_score numeric DEFAULT 0,
  fraud_indicators jsonb DEFAULT '[]',
  last_fraud_scan timestamptz,
  is_marketplace_listed boolean DEFAULT false,
  price_range_min numeric DEFAULT 0,
  price_range_max numeric DEFAULT 0,
  portfolio_urls text[] DEFAULT '{}',
  total_campaigns_completed integer DEFAULT 0,
  disputes integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id),
  name text NOT NULL,
  status public.campaign_status NOT NULL DEFAULT 'draft',
  budget numeric NOT NULL DEFAULT 0,
  spent numeric NOT NULL DEFAULT 0,
  platforms text[] NOT NULL DEFAULT '{}',
  content_type text DEFAULT 'video',
  start_date date,
  end_date date,
  target_audience jsonb DEFAULT '{}',
  payroll_formula jsonb DEFAULT '{"base_pay": 500, "performance_multiplier": 2.5, "conversion_bonus": 0, "audience_match_weight": 1.0}',
  roas numeric DEFAULT 0,
  cpa numeric DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  total_conversions integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Campaign-Creator assignments
CREATE TABLE IF NOT EXISTS public.campaign_creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  creator_id uuid NOT NULL REFERENCES public.creators(id),
  status text NOT NULL DEFAULT 'invited',
  base_pay numeric DEFAULT 0,
  total_earned numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Creator content submissions
CREATE TABLE IF NOT EXISTS public.creator_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_creator_id uuid NOT NULL REFERENCES public.campaign_creators(id),
  platform text NOT NULL,
  content_url text,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  saves integer DEFAULT 0,
  watch_time_pct numeric DEFAULT 0,
  ctr numeric DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  completion_rate numeric DEFAULT 0,
  performance_score numeric DEFAULT 0,
  audience_match_score numeric DEFAULT 0,
  fraud_risk_score numeric DEFAULT 0,
  fraud_indicators jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payout batches
CREATE TABLE IF NOT EXISTS public.payout_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id),
  batch_number text NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  creator_count integer DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  payment_method text NOT NULL DEFAULT 'paypal',
  paypal_batch_id text,
  status text NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  processed_at timestamptz,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Campaign escrow
CREATE TABLE IF NOT EXISTS public.campaign_escrow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  amount numeric NOT NULL DEFAULT 0,
  released_amount numeric DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'funded',
  funded_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Payroll entries
CREATE TABLE IF NOT EXISTS public.payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_creator_id uuid NOT NULL REFERENCES public.campaign_creators(id),
  content_id uuid REFERENCES public.creator_content(id),
  batch_id uuid REFERENCES public.payout_batches(id),
  escrow_id uuid REFERENCES public.campaign_escrow(id),
  base_pay numeric NOT NULL DEFAULT 0,
  perf_score numeric NOT NULL DEFAULT 0,
  match_score numeric NOT NULL DEFAULT 0,
  multiplier numeric NOT NULL DEFAULT 1,
  bonus numeric NOT NULL DEFAULT 0,
  total_payment numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  converted_amount numeric,
  converted_currency text,
  payment_method text DEFAULT 'paypal',
  payment_reference text,
  status public.payout_status NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Creator payment profiles
CREATE TABLE IF NOT EXISTS public.creator_payment_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creators(id) UNIQUE,
  payment_method text NOT NULL DEFAULT 'paypal',
  preferred_currency text NOT NULL DEFAULT 'USD',
  paypal_email text,
  wise_email text,
  bank_name text,
  bank_country text,
  bank_routing_number text,
  bank_account_number text,
  tax_form_type text,
  tax_form_verified boolean DEFAULT false,
  tax_form_submitted_at timestamptz,
  tax_id_last_four text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Creator tax documents
CREATE TABLE IF NOT EXISTS public.creator_tax_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creators(id),
  document_type text NOT NULL,
  tax_year integer,
  legal_name text,
  business_name text,
  tax_classification text,
  ssn_last_four text,
  ein_last_four text,
  foreign_tax_id text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'US',
  signature_data text,
  signed_at timestamptz,
  verified_at timestamptz,
  verified_by uuid,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Brand-creator ratings
CREATE TABLE IF NOT EXISTS public.brand_creator_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id),
  creator_id uuid NOT NULL REFERENCES public.creators(id),
  campaign_id uuid REFERENCES public.campaigns(id),
  overall_rating integer NOT NULL,
  professionalism_rating integer,
  delivery_rating integer,
  content_quality_rating integer,
  communication_rating integer,
  review_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Conversion tracking
CREATE TABLE IF NOT EXISTS public.conversion_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  creator_id uuid REFERENCES public.creators(id),
  tracking_code text NOT NULL,
  tracking_type text NOT NULL DEFAULT 'utm',
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  signups integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Content analysis (AI)
CREATE TABLE IF NOT EXISTS public.content_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.creator_content(id),
  brand_exposure_score numeric DEFAULT 0,
  sentiment_score numeric DEFAULT 0,
  ad_compliance_score numeric DEFAULT 0,
  content_quality_score numeric DEFAULT 0,
  brand_safety_score numeric DEFAULT 0,
  product_visibility boolean DEFAULT false,
  brand_logo_seconds numeric DEFAULT 0,
  verbal_mentions integer DEFAULT 0,
  key_findings jsonb DEFAULT '[]',
  model_used text,
  analyzed_at timestamptz NOT NULL DEFAULT now()
);

-- Performance alerts (real-time)
CREATE TABLE IF NOT EXISTS public.performance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id),
  creator_id uuid REFERENCES public.creators(id),
  content_id uuid REFERENCES public.creator_content(id),
  title text NOT NULL,
  message text,
  alert_type text NOT NULL DEFAULT 'info',
  metric_name text,
  metric_value numeric,
  threshold numeric,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Campaign automations
CREATE TABLE IF NOT EXISTS public.campaign_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  brand_id uuid NOT NULL REFERENCES public.brands(id),
  automation_type text NOT NULL DEFAULT 'creator_selection',
  config jsonb DEFAULT '{}',
  results jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Creator contracts
CREATE TABLE IF NOT EXISTS public.creator_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id),
  creator_id uuid NOT NULL REFERENCES public.creators(id),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id),
  contract_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  terms text,
  base_pay numeric DEFAULT 0,
  deliverables jsonb DEFAULT '[]',
  bonus_structure jsonb DEFAULT '{}',
  payment_milestones jsonb DEFAULT '[]',
  start_date date,
  end_date date,
  signed_by_brand boolean DEFAULT false,
  signed_by_brand_at timestamptz,
  brand_signature text,
  signed_by_creator boolean DEFAULT false,
  signed_by_creator_at timestamptz,
  creator_signature text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Creator loyalty
CREATE TABLE IF NOT EXISTS public.creator_loyalty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creators(id) UNIQUE,
  tier text NOT NULL DEFAULT 'bronze',
  total_points integer DEFAULT 0,
  campaigns_completed integer DEFAULT 0,
  consecutive_on_time integer DEFAULT 0,
  lifetime_earnings numeric DEFAULT 0,
  tier_updated_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Compliance records
CREATE TABLE IF NOT EXISTS public.compliance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creators(id),
  brand_id uuid REFERENCES public.brands(id),
  compliance_type text NOT NULL,
  jurisdiction text NOT NULL DEFAULT 'US',
  status text NOT NULL DEFAULT 'pending',
  tax_year integer,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  due_date date,
  filed_at timestamptz,
  document_ref text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Industry benchmarks
CREATE TABLE IF NOT EXISTS public.industry_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  category text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  period text DEFAULT 'monthly',
  sample_size integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- ========== REALTIME ==========
-- Safe to re-run: add to publication only if not already added

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_alerts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ========== FUNCTIONS ==========

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ========== RLS POLICIES ==========
-- Safe to re-run: drop policies first, then create

-- Enable RLS on all tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_payment_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_creator_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_benchmarks ENABLE ROW LEVEL SECURITY;

-- Brands: owner access
DROP POLICY IF EXISTS "Users manage own brand" ON public.brands;
CREATE POLICY "Users manage own brand" ON public.brands FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Creators: public read
DROP POLICY IF EXISTS "Creators readable by authenticated" ON public.creators;
DROP POLICY IF EXISTS "Authenticated users can create creators" ON public.creators;
CREATE POLICY "Creators readable by authenticated" ON public.creators FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create creators" ON public.creators FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
GRANT INSERT ON TABLE public.creators TO authenticated;

-- Campaigns: brand owner
DROP POLICY IF EXISTS "Brands manage own campaigns" ON public.campaigns;
CREATE POLICY "Brands manage own campaigns" ON public.campaigns FOR ALL
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Campaign creators: via campaign → brand chain
DROP POLICY IF EXISTS "Brands manage campaign creators" ON public.campaign_creators;
CREATE POLICY "Brands manage campaign creators" ON public.campaign_creators FOR ALL
  USING (campaign_id IN (SELECT c.id FROM campaigns c WHERE c.brand_id IN (SELECT b.id FROM brands b WHERE b.user_id = auth.uid())))
  WITH CHECK (campaign_id IN (SELECT c.id FROM campaigns c WHERE c.brand_id IN (SELECT b.id FROM brands b WHERE b.user_id = auth.uid())));

-- Creator content
DROP POLICY IF EXISTS "Brands view campaign content" ON public.creator_content;
DROP POLICY IF EXISTS "Authenticated users can insert content" ON public.creator_content;
DROP POLICY IF EXISTS "Authenticated users can update content" ON public.creator_content;
CREATE POLICY "Brands view campaign content" ON public.creator_content FOR SELECT
  USING (campaign_creator_id IN (SELECT cc.id FROM campaign_creators cc JOIN campaigns c ON cc.campaign_id = c.id JOIN brands b ON c.brand_id = b.id WHERE b.user_id = auth.uid()));
CREATE POLICY "Authenticated users can insert content" ON public.creator_content FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update content" ON public.creator_content FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Payroll
DROP POLICY IF EXISTS "Brands view payroll" ON public.payroll;
DROP POLICY IF EXISTS "Authenticated users can create payroll" ON public.payroll;
DROP POLICY IF EXISTS "Brands can update payroll status" ON public.payroll;
CREATE POLICY "Brands view payroll" ON public.payroll FOR SELECT
  USING (campaign_creator_id IN (SELECT cc.id FROM campaign_creators cc JOIN campaigns c ON cc.campaign_id = c.id JOIN brands b ON c.brand_id = b.id WHERE b.user_id = auth.uid()));
CREATE POLICY "Authenticated users can create payroll" ON public.payroll FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Brands can update payroll status" ON public.payroll FOR UPDATE
  USING (campaign_creator_id IN (SELECT cc.id FROM campaign_creators cc JOIN campaigns c ON cc.campaign_id = c.id JOIN brands b ON c.brand_id = b.id WHERE b.user_id = auth.uid()));

-- Payout batches
DROP POLICY IF EXISTS "Brands manage own payout batches" ON public.payout_batches;
CREATE POLICY "Brands manage own payout batches" ON public.payout_batches FOR ALL
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Escrow
DROP POLICY IF EXISTS "Brands manage own escrow" ON public.campaign_escrow;
CREATE POLICY "Brands manage own escrow" ON public.campaign_escrow FOR ALL
  USING (campaign_id IN (SELECT c.id FROM campaigns c JOIN brands b ON c.brand_id = b.id WHERE b.user_id = auth.uid()))
  WITH CHECK (campaign_id IN (SELECT c.id FROM campaigns c JOIN brands b ON c.brand_id = b.id WHERE b.user_id = auth.uid()));

-- Payment profiles
DROP POLICY IF EXISTS "Brands can view creator payment profiles" ON public.creator_payment_profiles;
DROP POLICY IF EXISTS "Brands can insert creator payment profiles" ON public.creator_payment_profiles;
DROP POLICY IF EXISTS "Brands can update creator payment profiles" ON public.creator_payment_profiles;
CREATE POLICY "Brands can view creator payment profiles" ON public.creator_payment_profiles FOR SELECT
  USING (creator_id IN (SELECT cc.creator_id FROM campaign_creators cc JOIN campaigns c ON cc.campaign_id = c.id JOIN brands b ON c.brand_id = b.id WHERE b.user_id = auth.uid()));
CREATE POLICY "Brands can insert creator payment profiles" ON public.creator_payment_profiles FOR INSERT
  WITH CHECK (creator_id IN (SELECT cc.creator_id FROM campaign_creators cc JOIN campaigns c ON cc.campaign_id = c.id JOIN brands b ON c.brand_id = b.id WHERE b.user_id = auth.uid()));
CREATE POLICY "Brands can update creator payment profiles" ON public.creator_payment_profiles FOR UPDATE
  USING (creator_id IN (SELECT cc.creator_id FROM campaign_creators cc JOIN campaigns c ON cc.campaign_id = c.id JOIN brands b ON c.brand_id = b.id WHERE b.user_id = auth.uid()));

-- Tax docs
DROP POLICY IF EXISTS "Brands can view tax docs of their creators" ON public.creator_tax_documents;
CREATE POLICY "Brands can view tax docs of their creators" ON public.creator_tax_documents FOR SELECT
  USING (creator_id IN (SELECT cc.creator_id FROM campaign_creators cc JOIN campaigns c ON cc.campaign_id = c.id JOIN brands b ON c.brand_id = b.id WHERE b.user_id = auth.uid()));

-- Brand-creator ratings
DROP POLICY IF EXISTS "Brands manage own ratings" ON public.brand_creator_ratings;
DROP POLICY IF EXISTS "Public read ratings" ON public.brand_creator_ratings;
CREATE POLICY "Brands manage own ratings" ON public.brand_creator_ratings FOR ALL
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));
CREATE POLICY "Public read ratings" ON public.brand_creator_ratings FOR SELECT USING (true);

-- Conversion tracking
DROP POLICY IF EXISTS "Brands manage own conversions" ON public.conversion_tracking;
CREATE POLICY "Brands manage own conversions" ON public.conversion_tracking FOR ALL
  USING (campaign_id IN (SELECT c.id FROM campaigns c WHERE c.brand_id IN (SELECT b.id FROM brands b WHERE b.user_id = auth.uid())))
  WITH CHECK (campaign_id IN (SELECT c.id FROM campaigns c WHERE c.brand_id IN (SELECT b.id FROM brands b WHERE b.user_id = auth.uid())));

-- Content analysis
DROP POLICY IF EXISTS "Brands view content analysis" ON public.content_analysis;
DROP POLICY IF EXISTS "Insert content analysis" ON public.content_analysis;
CREATE POLICY "Brands view content analysis" ON public.content_analysis FOR SELECT
  USING (content_id IN (SELECT cc.id FROM creator_content cc JOIN campaign_creators ccr ON cc.campaign_creator_id = ccr.id JOIN campaigns c ON ccr.campaign_id = c.id JOIN brands b ON c.brand_id = b.id WHERE b.user_id = auth.uid()));
CREATE POLICY "Insert content analysis" ON public.content_analysis FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Performance alerts
DROP POLICY IF EXISTS "Brands view own alerts" ON public.performance_alerts;
CREATE POLICY "Brands view own alerts" ON public.performance_alerts FOR ALL
  USING (campaign_id IN (SELECT c.id FROM campaigns c WHERE c.brand_id IN (SELECT b.id FROM brands b WHERE b.user_id = auth.uid())))
  WITH CHECK (campaign_id IN (SELECT c.id FROM campaigns c WHERE c.brand_id IN (SELECT b.id FROM brands b WHERE b.user_id = auth.uid())));

-- Campaign automations
DROP POLICY IF EXISTS "Brands manage own automations" ON public.campaign_automations;
CREATE POLICY "Brands manage own automations" ON public.campaign_automations FOR ALL
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Creator contracts
DROP POLICY IF EXISTS "Brands manage own contracts" ON public.creator_contracts;
CREATE POLICY "Brands manage own contracts" ON public.creator_contracts FOR ALL
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Creator loyalty
DROP POLICY IF EXISTS "Loyalty readable by authenticated" ON public.creator_loyalty;
DROP POLICY IF EXISTS "Loyalty insert by authenticated" ON public.creator_loyalty;
DROP POLICY IF EXISTS "Loyalty update by authenticated" ON public.creator_loyalty;
CREATE POLICY "Loyalty readable by authenticated" ON public.creator_loyalty FOR SELECT USING (true);
CREATE POLICY "Loyalty insert by authenticated" ON public.creator_loyalty FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Loyalty update by authenticated" ON public.creator_loyalty FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Compliance records
DROP POLICY IF EXISTS "Brands manage compliance" ON public.compliance_records;
DROP POLICY IF EXISTS "Read compliance authenticated" ON public.compliance_records;
CREATE POLICY "Brands manage compliance" ON public.compliance_records FOR ALL
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));
CREATE POLICY "Read compliance authenticated" ON public.compliance_records FOR SELECT USING (auth.uid() IS NOT NULL);

-- Industry benchmarks
DROP POLICY IF EXISTS "Benchmarks readable by authenticated" ON public.industry_benchmarks;
DROP POLICY IF EXISTS "Benchmarks insert by authenticated" ON public.industry_benchmarks;
CREATE POLICY "Benchmarks readable by authenticated" ON public.industry_benchmarks FOR SELECT USING (true);
CREATE POLICY "Benchmarks insert by authenticated" ON public.industry_benchmarks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
