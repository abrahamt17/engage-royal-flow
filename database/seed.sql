-- ===========================================
-- CreatorPay Seed Data
-- Run after schema.sql to populate with sample data
-- ===========================================

-- NOTE: You need a real auth.users user_id to seed brands.
-- Replace 'YOUR_USER_ID' with an actual user UUID after signing up.

-- ========== CREATORS ==========

INSERT INTO public.creators (name, handle, platforms, category, bio, location, languages, follower_count, avg_engagement_rate, trust_score, delivery_reliability, contract_completion_rate, audience_authenticity, is_marketplace_listed, price_range_min, price_range_max, audience_demographics) VALUES
('Alex Tech',      '@alextech',      '{"tiktok","youtube"}',    'tech',       'Tech reviewer & gadget enthusiast',         'San Francisco, US', '{"en"}',           520000, 6.8, 88, 92, 95, 87, true,  500,  3000, '{"age_18_24": 35, "age_25_34": 40, "us": 65}'),
('Sarah Beauty',   '@sarahbeauty',   '{"instagram","youtube"}', 'beauty',     'Beauty & skincare creator',                 'Los Angeles, US',   '{"en","es"}',      340000, 5.2, 82, 88, 90, 91, true,  300,  2000, '{"age_18_24": 45, "age_25_34": 35, "us": 70}'),
('FitLife Mike',   '@fitlifemike',   '{"tiktok","instagram"}',  'fitness',    'Fitness coach & nutrition expert',          'Miami, US',         '{"en"}',           280000, 7.1, 91, 95, 98, 93, true,  400,  2500, '{"age_18_24": 30, "age_25_34": 45, "us": 60}'),
('Emma Travel',    '@emmatravel',    '{"youtube","instagram"}', 'travel',     'Travel vlogger & adventure seeker',         'London, UK',        '{"en","fr"}',      410000, 4.9, 79, 85, 88, 84, true,  600,  4000, '{"age_25_34": 50, "age_35_44": 25, "uk": 40, "us": 30}'),
('Chef Marco',     '@chefmarco',     '{"tiktok","youtube"}',    'food',       'Professional chef sharing quick recipes',   'New York, US',      '{"en","it"}',      680000, 8.2, 94, 97, 99, 96, true,  800,  5000, '{"age_25_34": 40, "age_35_44": 30, "us": 55}'),
('GameZone Pro',   '@gamezone',      '{"twitch","youtube"}',    'gaming',     'Pro gamer & game reviewer',                 'Austin, US',        '{"en"}',           920000, 3.8, 75, 80, 85, 70, true,  1000, 8000, '{"age_13_17": 25, "age_18_24": 45, "us": 50}'),
('Priya Fashion',  '@priyafashion',  '{"instagram"}',           'fashion',    'Sustainable fashion advocate',              'Mumbai, IN',        '{"en","hi"}',      190000, 9.1, 86, 90, 92, 88, true,  200,  1500, '{"age_18_24": 50, "age_25_34": 35, "in": 60}'),
('Dan Finance',    '@danfinance',    '{"youtube","twitter"}',   'finance',    'Personal finance & investing tips',         'Chicago, US',       '{"en"}',           310000, 4.5, 83, 87, 91, 85, true,  700,  4500, '{"age_25_34": 45, "age_35_44": 35, "us": 75}');

-- ========== INDUSTRY BENCHMARKS ==========

INSERT INTO public.industry_benchmarks (platform, category, metric_name, metric_value, period, sample_size) VALUES
('tiktok',    'tech',     'avg_engagement_rate', 5.8,   'monthly', 12400),
('tiktok',    'beauty',   'avg_engagement_rate', 6.2,   'monthly', 18500),
('tiktok',    'fitness',  'avg_engagement_rate', 7.1,   'monthly', 9800),
('tiktok',    'food',     'avg_engagement_rate', 8.5,   'monthly', 15200),
('youtube',   'tech',     'avg_engagement_rate', 3.2,   'monthly', 8900),
('youtube',   'beauty',   'avg_engagement_rate', 3.8,   'monthly', 11200),
('youtube',   'gaming',   'avg_engagement_rate', 4.1,   'monthly', 14500),
('instagram', 'fashion',  'avg_engagement_rate', 4.5,   'monthly', 22000),
('instagram', 'beauty',   'avg_engagement_rate', 3.9,   'monthly', 19800),
('tiktok',    'tech',     'avg_cpm',             12.50, 'monthly', 12400),
('tiktok',    'beauty',   'avg_cpm',             15.20, 'monthly', 18500),
('youtube',   'tech',     'avg_cpm',             18.00, 'monthly', 8900),
('youtube',   'gaming',   'avg_cpm',             9.50,  'monthly', 14500),
('instagram', 'fashion',  'avg_cpm',             11.80, 'monthly', 22000),
('tiktok',    'tech',     'avg_cpa',             8.20,  'monthly', 12400),
('tiktok',    'fitness',  'avg_cpa',             6.50,  'monthly', 9800),
('youtube',   'finance',  'avg_cpa',             22.00, 'monthly', 5400),
('instagram', 'beauty',   'avg_cpa',             14.30, 'monthly', 19800);

-- ========== CREATOR LOYALTY ==========

INSERT INTO public.creator_loyalty (creator_id, tier, total_points, campaigns_completed, consecutive_on_time, lifetime_earnings)
SELECT id, 
  CASE 
    WHEN trust_score >= 90 THEN 'platinum'
    WHEN trust_score >= 80 THEN 'gold'
    WHEN trust_score >= 70 THEN 'silver'
    ELSE 'bronze'
  END,
  (trust_score * 10)::integer,
  total_campaigns_completed,
  GREATEST(0, total_campaigns_completed - disputes),
  0
FROM public.creators;

-- ===========================================
-- To seed brands, campaigns, and payroll:
-- 1. Sign up a user in the app
-- 2. Use the app UI to create a brand, campaigns, assign creators
-- 3. Or run the following with YOUR_USER_ID replaced:
-- ===========================================

-- INSERT INTO public.brands (user_id, company_name, industry) VALUES ('YOUR_USER_ID', 'Acme Corp', 'technology');
-- Then create campaigns referencing the brand_id, etc.
