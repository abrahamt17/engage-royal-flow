-- Creator payment profiles for multi-currency and payment method preferences
CREATE TABLE public.creator_payment_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL UNIQUE,
  payment_method TEXT NOT NULL DEFAULT 'paypal' CHECK (payment_method IN ('paypal', 'wise', 'bank_transfer', 'stripe')),
  paypal_email TEXT,
  wise_email TEXT,
  bank_account_number TEXT,
  bank_routing_number TEXT,
  bank_name TEXT,
  bank_country TEXT,
  preferred_currency TEXT NOT NULL DEFAULT 'USD',
  tax_form_type TEXT CHECK (tax_form_type IN ('w9', 'w8ben', 'w8ben_e')),
  tax_form_submitted_at TIMESTAMPTZ,
  tax_form_verified BOOLEAN DEFAULT false,
  tax_id_last_four TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campaign escrow for holding funds until deliverables approved
CREATE TABLE public.campaign_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'funded' CHECK (status IN ('funded', 'partially_released', 'fully_released', 'refunded')),
  funded_at TIMESTAMPTZ DEFAULT now(),
  released_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payout batches for scheduled bulk payments
CREATE TABLE public.payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  batch_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'processing', 'completed', 'failed', 'cancelled')),
  scheduled_for TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL DEFAULT 'paypal',
  paypal_batch_id TEXT,
  creator_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link payroll records to batches
ALTER TABLE public.payroll 
ADD COLUMN batch_id UUID REFERENCES public.payout_batches(id),
ADD COLUMN payment_method TEXT DEFAULT 'paypal',
ADD COLUMN payment_reference TEXT,
ADD COLUMN escrow_id UUID REFERENCES public.campaign_escrow(id),
ADD COLUMN converted_amount NUMERIC,
ADD COLUMN converted_currency TEXT;

-- Tax documents storage
CREATE TABLE public.creator_tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('w9', 'w8ben', 'w8ben_e', '1099')),
  tax_year INTEGER,
  legal_name TEXT,
  business_name TEXT,
  tax_classification TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  ssn_last_four TEXT,
  ein_last_four TEXT,
  foreign_tax_id TEXT,
  signature_data TEXT,
  signed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_payment_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_tax_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_payment_profiles
CREATE POLICY "Brands can view creator payment profiles" ON public.creator_payment_profiles
  FOR SELECT TO authenticated
  USING (creator_id IN (
    SELECT cc.creator_id FROM campaign_creators cc
    JOIN campaigns c ON cc.campaign_id = c.id
    JOIN brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- RLS Policies for campaign_escrow
CREATE POLICY "Brands manage own escrow" ON public.campaign_escrow
  FOR ALL TO authenticated
  USING (campaign_id IN (
    SELECT c.id FROM campaigns c
    JOIN brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  ))
  WITH CHECK (campaign_id IN (
    SELECT c.id FROM campaigns c
    JOIN brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- RLS Policies for payout_batches
CREATE POLICY "Brands manage own payout batches" ON public.payout_batches
  FOR ALL TO authenticated
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- RLS Policies for creator_tax_documents
CREATE POLICY "Brands can view tax docs of their creators" ON public.creator_tax_documents
  FOR SELECT TO authenticated
  USING (creator_id IN (
    SELECT cc.creator_id FROM campaign_creators cc
    JOIN campaigns c ON cc.campaign_id = c.id
    JOIN brands b ON c.brand_id = b.id
    WHERE b.user_id = auth.uid()
  ));

-- Triggers for updated_at
CREATE TRIGGER update_creator_payment_profiles_updated_at
  BEFORE UPDATE ON public.creator_payment_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_escrow_updated_at
  BEFORE UPDATE ON public.campaign_escrow
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payout_batches_updated_at
  BEFORE UPDATE ON public.payout_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();