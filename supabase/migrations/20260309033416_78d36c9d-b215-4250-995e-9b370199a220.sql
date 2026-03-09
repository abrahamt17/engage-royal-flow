
-- Contracts table
CREATE TABLE public.creator_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  contract_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  deliverables jsonb DEFAULT '[]',
  payment_milestones jsonb DEFAULT '[]',
  terms text,
  start_date date,
  end_date date,
  base_pay numeric DEFAULT 0,
  bonus_structure jsonb DEFAULT '{}',
  signed_by_brand boolean DEFAULT false,
  signed_by_brand_at timestamptz,
  signed_by_creator boolean DEFAULT false,
  signed_by_creator_at timestamptz,
  brand_signature text,
  creator_signature text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands manage own contracts" ON public.creator_contracts
  FOR ALL TO authenticated
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Real-time alerts table
CREATE TABLE public.performance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES public.creators(id) ON DELETE SET NULL,
  content_id uuid REFERENCES public.creator_content(id) ON DELETE SET NULL,
  alert_type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text,
  metric_name text,
  metric_value numeric,
  threshold numeric,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands view own alerts" ON public.performance_alerts
  FOR ALL TO authenticated
  USING (campaign_id IN (SELECT id FROM campaigns WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())))
  WITH CHECK (campaign_id IN (SELECT id FROM campaigns WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())));

-- Campaign automation table
CREATE TABLE public.campaign_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  automation_type text NOT NULL DEFAULT 'creator_selection',
  config jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  last_run_at timestamptz,
  results jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands manage own automations" ON public.campaign_automations
  FOR ALL TO authenticated
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()))
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_alerts;
