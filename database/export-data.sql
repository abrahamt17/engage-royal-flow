-- ===========================================
-- CreatorPay Data Export
-- Generated: 2026-03-12
-- Import this AFTER running schema.sql
-- ===========================================

-- ========== BRANDS ==========
INSERT INTO public.brands (id, user_id, company_name, industry, default_currency, default_base_pay, performance_multiplier, created_at, updated_at)
VALUES (
  '9dfa77ba-45ea-4f6f-a3f1-d7b52ee9620b',
  'c5b65b8a-c069-4fd8-833f-a20071a2a60f',
  'Football Universe',
  NULL,
  'USD',
  500,
  2.5,
  '2026-03-09 00:15:32.371276+00',
  '2026-03-09 00:15:32.371276+00'
);

-- ========== CREATORS ==========
INSERT INTO public.creators (id, name, handle, platforms, category, bio, location, languages, follower_count, avg_engagement_rate, audience_demographics, trust_score, delivery_reliability, contract_completion_rate, audience_authenticity, fraud_risk_score, fraud_indicators, last_fraud_scan, is_marketplace_listed, price_range_min, price_range_max, portfolio_urls, total_campaigns_completed, disputes, created_at, updated_at)
VALUES
  ('17f0b1cf-17e3-4c47-aa03-c5583c37ffe7', 'Mia Chen', '@miachen', ARRAY['TikTok'], 'Lifestyle', NULL, NULL, '{}', 2400000, 8.2, '{"age":{"18-24":42,"25-34":35,"35-44":15,"45+":8},"gender":{"female":68,"male":32},"top_countries":["US","CA","UK"]}', 50, 0, 0, 0, 5, '[]', NULL, false, 0, 0, '{}', 0, 0, '2026-03-08 23:30:40.696904+00', '2026-03-08 23:30:40.696904+00'),
  ('990ae46b-d003-4169-90e2-4702d2e54836', 'Jake Williams', '@jakew', ARRAY['YouTube'], 'Tech', NULL, NULL, '{}', 890000, 6.1, '{"age":{"18-24":30,"25-34":45,"35-44":18,"45+":7},"gender":{"female":25,"male":75},"top_countries":["US","DE","IN"]}', 50, 0, 0, 0, 3, '[]', NULL, false, 0, 0, '{}', 0, 0, '2026-03-08 23:30:40.696904+00', '2026-03-08 23:30:40.696904+00'),
  ('212aae24-f8dd-4d90-8eea-40d20457efec', 'Priya Patel', '@priyap', ARRAY['Instagram'], 'Fashion', NULL, NULL, '{}', 1100000, 7.5, '{"age":{"18-24":55,"25-34":30,"35-44":10,"45+":5},"gender":{"female":82,"male":18},"top_countries":["US","IN","UK"]}', 50, 0, 0, 0, 8, '[]', NULL, false, 0, 0, '{}', 0, 0, '2026-03-08 23:30:40.696904+00', '2026-03-08 23:30:40.696904+00'),
  ('f8fa63ec-4dc1-44c2-b260-62762a389eca', 'Carlos Rivera', '@carlosr', ARRAY['TikTok'], 'Entertainment', NULL, NULL, '{}', 3200000, 9.8, '{"age":{"18-24":60,"25-34":25,"35-44":10,"45+":5},"gender":{"female":45,"male":55},"top_countries":["US","MX","BR"]}', 50, 0, 0, 0, 32, '[]', NULL, false, 0, 0, '{}', 0, 0, '2026-03-08 23:30:40.696904+00', '2026-03-08 23:30:40.696904+00'),
  ('4319c7c3-1423-42e0-9a13-8665e43a95d0', 'Emma Davis', '@emmad', ARRAY['TikTok','Instagram','YouTube'], 'Fitness', NULL, NULL, '{}', 560000, 11.2, '{"age":{"18-24":35,"25-34":45,"35-44":15,"45+":5},"gender":{"female":72,"male":28},"top_countries":["US","AU","UK"]}', 50, 0, 0, 0, 2, '[]', NULL, false, 0, 0, '{}', 0, 0, '2026-03-08 23:30:40.696904+00', '2026-03-08 23:30:40.696904+00'),
  ('5df2ea1f-8e70-4fd4-8abc-493e0f1817e5', 'Liam Park', '@liamp', ARRAY['YouTube'], 'Gaming', NULL, NULL, '{}', 1800000, 5.4, '{"age":{"18-24":65,"25-34":25,"35-44":7,"45+":3},"gender":{"female":15,"male":85},"top_countries":["US","KR","JP"]}', 50, 0, 0, 0, 6, '[]', NULL, false, 0, 0, '{}', 0, 0, '2026-03-08 23:30:40.696904+00', '2026-03-08 23:30:40.696904+00'),
  ('71f33c8a-548c-4a60-9f0e-d278af1520f5', 'Sofia Martinez', '@sofiam', ARRAY['Instagram','TikTok'], 'Beauty', NULL, NULL, '{}', 920000, 8.9, '{"age":{"18-24":50,"25-34":35,"35-44":10,"45+":5},"gender":{"female":90,"male":10},"top_countries":["US","ES","MX"]}', 50, 0, 0, 0, 4, '[]', NULL, false, 0, 0, '{}', 0, 0, '2026-03-08 23:30:40.696904+00', '2026-03-08 23:30:40.696904+00');

-- ========== CAMPAIGNS ==========
INSERT INTO public.campaigns (id, brand_id, name, status, budget, spent, platforms, content_type, start_date, end_date, target_audience, payroll_formula, roas, cpa, total_revenue, total_conversions, created_at, updated_at)
VALUES (
  'a903d73f-599b-4a97-8b98-1afa983dcf97',
  '9dfa77ba-45ea-4f6f-a3f1-d7b52ee9620b',
  'Autumn id here',
  'draft',
  10,
  0,
  ARRAY['TikTok','Instagram','YouTube'],
  'video',
  '2026-03-09',
  '2026-03-11',
  '{"age_range":"18-34","countries":["US"],"genders":"all"}',
  '{"base_pay":500,"conversion_bonus":0,"audience_match_weight":1,"performance_multiplier":2.5}',
  0, 0, 0, 0,
  '2026-03-09 00:41:19.909052+00',
  '2026-03-09 00:41:19.909052+00'
);

-- ========== ALL OTHER TABLES ARE EMPTY ==========
-- campaign_creators: 0 rows
-- creator_content: 0 rows
-- payroll: 0 rows
-- payout_batches: 0 rows
-- campaign_escrow: 0 rows
-- creator_payment_profiles: 0 rows
-- creator_tax_documents: 0 rows
-- brand_creator_ratings: 0 rows
-- conversion_tracking: 0 rows
-- content_analysis: 0 rows
-- performance_alerts: 0 rows
-- campaign_automations: 0 rows
-- creator_contracts: 0 rows
-- creator_loyalty: 0 rows
-- compliance_records: 0 rows
-- industry_benchmarks: 0 rows
--
-- After importing: run the brand user_id update from docs/MIGRATION.md (step 3).
