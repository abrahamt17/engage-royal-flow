
-- Creator loyalty tiers
CREATE TABLE public.creator_loyalty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE UNIQUE,
  tier text NOT NULL DEFAULT 'bronze',
  total_points integer DEFAULT 0,
  campaigns_completed integer DEFAULT 0,
  lifetime_earnings numeric DEFAULT 0,
  consecutive_on_time integer DEFAULT 0,
  tier_updated_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_loyalty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Loyalty readable by authenticated" ON public.creator_loyalty
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Loyalty insert by authenticated" ON public.creator_loyalty
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Loyalty update by authenticated" ON public.creator_loyalty
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- Compliance records
CREATE TABLE public.compliance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  compliance_type text NOT NULL,
  jurisdiction text NOT NULL DEFAULT 'US',
  tax_year integer,
  status text NOT NULL DEFAULT 'pending',
  amount numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  document_ref text,
  notes text,
  due_date date,
  filed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands manage compliance" ON public.compliance_records
  FOR ALL TO authenticated
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Read compliance authenticated" ON public.compliance_records
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- Industry benchmarks
CREATE TABLE public.industry_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  platform text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  sample_size integer DEFAULT 0,
  period text DEFAULT 'monthly',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.industry_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benchmarks readable by authenticated" ON public.industry_benchmarks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Benchmarks insert by authenticated" ON public.industry_benchmarks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
