import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
      {title}
    </h2>
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">{children}</div>
  </section>
);

const Code = ({ children }: { children: string }) => (
  <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap text-foreground">
    {children}
  </pre>
);

const toc = [
  { id: "overview", label: "1. Platform Overview" },
  { id: "architecture", label: "2. System Architecture" },
  { id: "tech-stack", label: "3. Technology Stack" },
  { id: "database", label: "4. Database Schema" },
  { id: "auth", label: "5. Authentication & Authorization" },
  { id: "modules", label: "6. Core Modules Deep Dive" },
  { id: "algorithms", label: "7. Algorithms & Scoring" },
  { id: "edge-functions", label: "8. Edge Functions (Backend)" },
  { id: "fraud", label: "9. Fraud Detection System" },
  { id: "ai", label: "10. AI Recommendation Engine" },
  { id: "payroll", label: "11. Payroll Computation Engine" },
  { id: "payment", label: "12. Payment Infrastructure" },
  { id: "api", label: "13. API Reference" },
  { id: "testing", label: "14. Testing Strategy" },
  { id: "security", label: "15. Security & Compliance" },
  { id: "deployment", label: "16. Deployment & DevOps" },
];

const DevManual = () => (
  <DashboardLayout title="Developer & Tester Manual" subtitle="Complete technical reference for engineers and QA">
    <div className="flex gap-8 max-w-7xl">
      {/* Sticky TOC */}
      <nav className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-28 space-y-1">
          <Link to="/docs">
            <Button variant="ghost" size="sm" className="mb-4 gap-2 text-xs">
              <ArrowLeft className="h-3 w-3" /> Back to Docs
            </Button>
          </Link>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="block text-xs text-muted-foreground hover:text-foreground py-1 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-10">
        <Card>
          <CardContent className="p-8 space-y-12">
            {/* 1 */}
            <Section id="overview" title="1. Platform Overview">
              <p><strong className="text-foreground">CreatorPay</strong> is a full-scale SaaS platform that enables companies (brands) to automatically pay social media content creators based on algorithmic performance metrics, audience targeting quality, and business outcomes.</p>
              <p>The platform replaces manual influencer payment workflows with an automated engine that:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Collects and normalizes engagement metrics (views, watch time, likes, shares, saves, CTR, conversions)</li>
                <li>Scores each piece of content using a weighted <strong className="text-foreground">Performance Score</strong> algorithm</li>
                <li>Evaluates <strong className="text-foreground">Audience Match Quality</strong> between campaign targets and actual viewers</li>
                <li>Computes payroll automatically using configurable formulas with milestone, virality, and retention bonuses</li>
                <li>Detects fraudulent engagement using anomaly detection and ML-based scoring</li>
                <li>Provides AI-powered recommendations for creator selection, posting times, and campaign optimization</li>
              </ul>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">React 18</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">Supabase</Badge>
                <Badge variant="outline">Deno Edge Functions</Badge>
                <Badge variant="outline">Tailwind CSS</Badge>
                <Badge variant="outline">Gemini AI</Badge>
              </div>
            </Section>

            <Separator />

            {/* 2 */}
            <Section id="architecture" title="2. System Architecture">
              <p>CreatorPay follows a <strong className="text-foreground">client-server architecture</strong> with a React SPA frontend and Supabase-powered backend:</p>
              <Code>{`┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Dashboard │ │ Campaign │ │ Creator  │ │  Analytics │  │
│  │  Pages   │ │  Mgmt    │ │  Mgmt    │ │  & Charts  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│       └─────────────┼───────────┼──────────────┘         │
│              React Query + Supabase Client               │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS / WebSocket
┌──────────────────────┴───────────────────────────────────┐
│                   BACKEND (Supabase)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ PostgreSQL│ │  Auth    │ │  Edge    │ │  Storage   │  │
│  │  + RLS   │ │ (GoTrue) │ │Functions │ │  Buckets   │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│                                                          │
│  Edge Functions:                                         │
│  • submit-metrics    → Score + payroll computation       │
│  • analyze-fraud     → ML fraud detection                │
│  • process-payouts   → Batch payment processing          │
│  • scheduled-payouts → Cron-based auto payouts           │
│  • manage-creators   → Creator onboarding API            │
│  • ai-recommendations→ Gemini-powered insights           │
└──────────────────────────────────────────────────────────┘`}</Code>

              <p><strong className="text-foreground">Data Flow:</strong></p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Brand creates a campaign with budget, target audience, and payroll formula</li>
                <li>Creators are onboarded and assigned to campaigns</li>
                <li>Content metrics are submitted → Edge Function scores performance</li>
                <li>Audience match is computed against campaign target demographics</li>
                <li>Payroll is calculated: <code className="bg-muted px-1 rounded text-foreground">Payment = BasePay × (PerfScore × MatchScore × Multiplier) + Bonuses</code></li>
                <li>Fraud detection runs to flag suspicious engagement</li>
                <li>Payments are batched and processed via PayPal/Wise/Bank</li>
              </ol>
            </Section>

            <Separator />

            {/* 3 */}
            <Section id="tech-stack" title="3. Technology Stack">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="font-semibold text-foreground mb-2">Frontend</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>React 18</strong> — Component UI framework</li>
                    <li>• <strong>TypeScript</strong> — Type safety across codebase</li>
                    <li>• <strong>Vite</strong> — Fast build tool with HMR</li>
                    <li>• <strong>Tailwind CSS</strong> — Utility-first styling with design tokens</li>
                    <li>• <strong>shadcn/ui</strong> — Radix-based component library</li>
                    <li>• <strong>React Query (TanStack)</strong> — Server state management</li>
                    <li>• <strong>React Router v6</strong> — Client-side routing</li>
                    <li>• <strong>Recharts</strong> — Data visualization</li>
                    <li>• <strong>Lucide Icons</strong> — Icon system</li>
                  </ul>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="font-semibold text-foreground mb-2">Backend</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Supabase (PostgreSQL)</strong> — Database + Auth + Realtime</li>
                    <li>• <strong>Row-Level Security (RLS)</strong> — Per-user data isolation</li>
                    <li>• <strong>Deno Edge Functions</strong> — Serverless backend logic</li>
                    <li>• <strong>OpenAI GPT-4o</strong> — AI recommendations</li>
                    <li>• <strong>GoTrue</strong> — Authentication engine</li>
                    <li>• <strong>pg_cron</strong> — Scheduled job execution</li>
                    <li>• <strong>pg_net</strong> — HTTP requests from database</li>
                  </ul>
                </div>
              </div>
            </Section>

            <Separator />

            {/* 4 */}
            <Section id="database" title="4. Database Schema">
              <p>The platform uses <strong className="text-foreground">10 core tables</strong> with enforced relationships and RLS policies:</p>
              <Code>{`TABLE: brands
  id              UUID (PK, auto-generated)
  user_id         UUID (FK → auth.users, unique per brand)
  company_name    TEXT (required)
  industry        TEXT (nullable)
  default_base_pay NUMERIC (default payroll base)
  default_currency TEXT (default: 'USD')
  performance_multiplier NUMERIC (campaign-level multiplier)

TABLE: campaigns
  id              UUID (PK)
  brand_id        UUID (FK → brands.id)
  name            TEXT (required)
  budget          NUMERIC (total campaign budget)
  spent           NUMERIC (running total of payouts)
  status          ENUM: draft | active | paused | completed
  platforms       TEXT[] (array: tiktok, instagram, youtube, etc.)
  content_type    TEXT (video, reel, post, story)
  target_audience JSONB (age, gender, country, interests, language)
  payroll_formula JSONB (base_pay, multiplier, conversion_bonus)
  start_date      DATE
  end_date        DATE

TABLE: creators
  id              UUID (PK)
  name            TEXT (required)
  handle          TEXT (required, @handle)
  platforms       TEXT[] (connected platforms)
  category        TEXT (gaming, beauty, tech, etc.)
  follower_count  INTEGER
  avg_engagement_rate NUMERIC (%)
  audience_demographics JSONB (age, gender, location data)
  fraud_risk_score NUMERIC (0-100, from ML analysis)
  fraud_indicators JSONB (array of detected anomalies)
  last_fraud_scan TIMESTAMPTZ

TABLE: campaign_creators (junction table)
  id              UUID (PK)
  campaign_id     UUID (FK → campaigns.id)
  creator_id      UUID (FK → creators.id)
  base_pay        NUMERIC (override per assignment)
  status          TEXT (invited, accepted, active, completed)
  total_earned    NUMERIC (running total)

TABLE: creator_content
  id              UUID (PK)
  campaign_creator_id UUID (FK → campaign_creators.id)
  platform        TEXT (tiktok, instagram, youtube)
  content_url     TEXT
  views           INTEGER
  likes           INTEGER
  comments        INTEGER
  shares          INTEGER
  saves           INTEGER
  watch_time_pct  NUMERIC (0-100)
  completion_rate NUMERIC (0-100)
  ctr             NUMERIC (click-through rate %)
  conversion_rate NUMERIC (%)
  performance_score NUMERIC (computed by algorithm)
  audience_match_score NUMERIC (0-100)
  fraud_risk_score NUMERIC (0-100)
  fraud_indicators JSONB

TABLE: payroll
  id              UUID (PK)
  campaign_creator_id UUID (FK → campaign_creators.id)
  content_id      UUID (FK → creator_content.id, nullable)
  base_pay        NUMERIC
  perf_score      NUMERIC
  match_score     NUMERIC
  multiplier      NUMERIC
  bonus           NUMERIC (milestone + virality + retention)
  total_payment   NUMERIC (final computed amount)
  currency        TEXT (default: 'USD')
  status          ENUM: pending | processing | paid | failed | flagged
  payment_method  TEXT (paypal, wise, bank)
  payment_reference TEXT
  batch_id        UUID (FK → payout_batches.id, nullable)
  escrow_id       UUID (FK → campaign_escrow.id, nullable)
  paid_at         TIMESTAMPTZ

TABLE: creator_payment_profiles
  id              UUID (PK)
  creator_id      UUID (FK → creators.id, one-to-one)
  payment_method  TEXT (paypal, wise, bank_transfer)
  paypal_email    TEXT
  wise_email      TEXT
  bank_name       TEXT
  bank_routing_number TEXT
  bank_account_number TEXT
  bank_country    TEXT
  preferred_currency TEXT
  tax_form_type   TEXT (W-9, W-8BEN)
  tax_form_submitted_at TIMESTAMPTZ
  tax_form_verified BOOLEAN

TABLE: creator_tax_documents
  id              UUID (PK)
  creator_id      UUID (FK → creators.id)
  document_type   TEXT (W-9, W-8BEN, 1099)
  legal_name      TEXT
  business_name   TEXT
  tax_classification TEXT
  ssn_last_four   TEXT
  ein_last_four   TEXT
  address, city, state, zip, country fields
  signature_data  TEXT
  signed_at       TIMESTAMPTZ
  verified_at     TIMESTAMPTZ

TABLE: payout_batches
  id              UUID (PK)
  brand_id        UUID (FK → brands.id)
  batch_number    TEXT (auto-generated: BATCH-YYYYMMDD-XXXX)
  total_amount    NUMERIC
  creator_count   INTEGER
  payment_method  TEXT
  status          TEXT (draft, scheduled, processing, completed, failed)
  scheduled_for   TIMESTAMPTZ
  processed_at    TIMESTAMPTZ

TABLE: campaign_escrow
  id              UUID (PK)
  campaign_id     UUID (FK → campaigns.id)
  amount          NUMERIC (held funds)
  released_amount NUMERIC (funds released to creators)
  status          TEXT (pending, funded, partially_released, released)
  funded_at       TIMESTAMPTZ`}</Code>

              <p><strong className="text-foreground">Row-Level Security (RLS):</strong> Every table has RLS enabled. Brands can only access their own data through <code className="bg-muted px-1 rounded text-foreground">auth.uid() = user_id</code> checks chained through foreign key relationships.</p>
            </Section>

            <Separator />

            {/* 5 */}
            <Section id="auth" title="5. Authentication & Authorization">
              <p>Authentication uses <strong className="text-foreground">Supabase GoTrue</strong> with email/password and Google OAuth:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Sign Up:</strong> Creates auth.users entry → triggers brand auto-creation via <code className="bg-muted px-1 rounded text-foreground">useAuth</code> hook</li>
                <li><strong>Sign In:</strong> Returns JWT session → stored in localStorage → attached to all API calls</li>
                <li><strong>Google OAuth:</strong> Uses Supabase Auth integration (<code className="bg-muted px-1 rounded text-foreground">supabase.auth.signInWithOAuth</code>)</li>
                <li><strong>Session Management:</strong> <code className="bg-muted px-1 rounded text-foreground">onAuthStateChange</code> listener set up before <code className="bg-muted px-1 rounded text-foreground">getSession</code> (required by Supabase docs)</li>
                <li><strong>Protected Routes:</strong> <code className="bg-muted px-1 rounded text-foreground">ProtectedRoute</code> component wraps all dashboard routes — redirects to /auth if unauthenticated</li>
                <li><strong>Brand Creation:</strong> On first login, a brand record is auto-created linked to the user's auth ID</li>
              </ul>
              <Code>{`// Auth flow in useAuth.tsx
onAuthStateChange → setUser/setSession
  → if session exists: fetchOrCreateBrand(userId)
  → setLoading(false)
  
// Safety: 5-second timeout prevents infinite loading
setTimeout(() => setLoading(false), 5000)`}</Code>
            </Section>

            <Separator />

            {/* 6 */}
            <Section id="modules" title="6. Core Modules Deep Dive">
              <h3 className="text-base font-semibold text-foreground mt-2">6.1 Campaign Management</h3>
              <p>Brands create campaigns with budget, platform targets, audience demographics, and payroll formulas. Campaigns go through a lifecycle: <Badge variant="outline">Draft</Badge> → <Badge variant="outline">Active</Badge> → <Badge variant="outline">Paused</Badge> → <Badge variant="outline">Completed</Badge>.</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Target Audience (JSONB):</strong> age_range, gender, country, interests, language, income_proxy, device_type</li>
                <li><strong>Payroll Formula (JSONB):</strong> base_pay, performance_multiplier, conversion_bonus, engagement_bonus</li>
                <li><strong>Escrow:</strong> Optional — locks budget in campaign_escrow table before campaign starts</li>
              </ul>

              <h3 className="text-base font-semibold text-foreground mt-6">6.2 Creator Management</h3>
              <p>Creators are onboarded via the Creator Onboarding form or manage-creators Edge Function. Each creator has:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Multi-platform support (TikTok, Instagram, YouTube, X/Twitter, Twitch)</li>
                <li>Category classification (Gaming, Beauty, Tech, Fitness, etc.)</li>
                <li>Audience demographics (age, gender, location breakdown)</li>
                <li>Payment profile (PayPal, Wise, Bank Transfer)</li>
                <li>Tax documentation (W-9 / W-8BEN)</li>
              </ul>

              <h3 className="text-base font-semibold text-foreground mt-6">6.3 Content Submission & Scoring</h3>
              <p>The Submit Content page collects raw metrics. On submission, the <code className="bg-muted px-1 rounded text-foreground">submit-metrics</code> Edge Function:</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Validates required fields (views, likes, watch_time_pct)</li>
                <li>Computes PerformanceScore using weighted algorithm</li>
                <li>Computes AudienceMatchScore against campaign targets</li>
                <li>Inserts creator_content record with scores</li>
                <li>Auto-calculates payroll with bonus detection</li>
                <li>Returns payout preview to the frontend</li>
              </ol>

              <h3 className="text-base font-semibold text-foreground mt-6">6.4 Analytics Dashboard</h3>
              <p>Real-time analytics computed from creator_content and payroll tables:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Total views, avg watch time, total shares, avg CTR</li>
                <li>Spend vs Views chart (line chart over time)</li>
                <li>Spend by Platform distribution</li>
                <li>Audience Match Quality histogram</li>
                <li>Campaign performance comparison</li>
                <li>Top performing creators leaderboard</li>
              </ul>
            </Section>

            <Separator />

            {/* 7 */}
            <Section id="algorithms" title="7. Algorithms & Scoring Engine">
              <h3 className="text-base font-semibold text-foreground mt-2">7.1 Performance Score</h3>
              <Code>{`PerformanceScore = 
  0.30 × WatchTimeScore      // Watch completion (0-100)
+ 0.20 × EngagementRate      // (likes+comments+shares+saves) / views × 100
+ 0.15 × ShareRate           // shares / views × 100
+ 0.15 × SaveRate            // saves / views × 100
+ 0.10 × CommentQuality      // comments / views × 100 (proxy)
+ 0.10 × CTR                 // Click-through rate %

Output: 0-100 normalized score`}</Code>

              <h3 className="text-base font-semibold text-foreground mt-6">7.2 Audience Match Score</h3>
              <Code>{`AudienceMatchScore = 
  0.35 × LocationMatch    // % overlap between target and actual viewer geography
+ 0.25 × AgeMatch         // % overlap in age demographics
+ 0.20 × InterestMatch    // Category alignment with campaign interests
+ 0.10 × GenderMatch      // Gender distribution alignment
+ 0.10 × LanguageMatch    // Language compatibility

Output: 0-1 (multiplied by 100 for display)`}</Code>

              <h3 className="text-base font-semibold text-foreground mt-6">7.3 Bonus System</h3>
              <Code>{`Milestone Bonuses:
  100,000 views  → +$50
  500,000 views  → +$200
  1,000,000 views → +$500

Virality Bonus:
  shareRate > 5% → +$100

Retention Bonus:
  watchTimePct > 80% → +$75`}</Code>
            </Section>

            <Separator />

            {/* 8 */}
            <Section id="edge-functions" title="8. Edge Functions (Backend APIs)">
              <p>All backend logic runs as <strong className="text-foreground">Deno Edge Functions</strong> deployed automatically:</p>

              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="font-semibold text-foreground text-xs mb-1">POST /functions/v1/submit-metrics</p>
                  <p className="text-xs">Accepts content metrics → computes PerformanceScore + AudienceMatchScore → creates payroll record → returns payout breakdown. This is the core scoring + payment engine.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="font-semibold text-foreground text-xs mb-1">POST /functions/v1/analyze-fraud</p>
                  <p className="text-xs">Scans all creators → analyzes engagement velocity, bot patterns, follower growth anomalies, geographic mismatches → assigns fraud_risk_score (0-100) → flags high-risk accounts.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="font-semibold text-foreground text-xs mb-1">POST /functions/v1/process-payouts</p>
                  <p className="text-xs">Takes batch of payroll IDs → groups by payment method → processes PayPal/Wise/Bank transfers → updates payroll status → records in payout_batches.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="font-semibold text-foreground text-xs mb-1">POST /functions/v1/scheduled-payouts</p>
                  <p className="text-xs">Called by pg_cron every 5 minutes → finds batches where scheduled_for has passed → auto-triggers process-payouts → fully automated payment pipeline.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="font-semibold text-foreground text-xs mb-1">POST /functions/v1/manage-creators</p>
                  <p className="text-xs">Creates new creator records with audience demographics → validates platform data → returns created creator profile.</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="font-semibold text-foreground text-xs mb-1">POST /functions/v1/ai-recommendations</p>
                  <p className="text-xs">Accepts type (recommend_creators, posting_time, content_prediction, campaign_optimization, brand_safety) + context → calls Gemini AI → returns structured analysis.</p>
                </div>
              </div>
            </Section>

            <Separator />

            {/* 9 */}
            <Section id="fraud" title="9. Fraud Detection System">
              <p>The fraud system uses <strong className="text-foreground">multi-signal anomaly detection</strong>:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Engagement Velocity:</strong> Detects unnatural spikes (e.g., 10x normal engagement in short window)</li>
                <li><strong>Bot Comment Patterns:</strong> Identifies repetitive, generic, or spam-like comment patterns</li>
                <li><strong>Follower Growth Anomalies:</strong> Sudden follower jumps without corresponding content</li>
                <li><strong>Geographic Mismatches:</strong> Engagement from regions misaligned with creator's audience</li>
                <li><strong>Engagement-to-Follower Ratio:</strong> Unnaturally high or low ratios</li>
              </ul>
              <Code>{`Fraud Risk Score Calculation:
  Each indicator adds weight to the score:
  - Engagement spike detected      → +15-25 points
  - Bot pattern match              → +20-30 points
  - Follower anomaly               → +10-20 points
  - Geographic mismatch            → +10-15 points
  - Engagement ratio out of range  → +5-15 points

  Score 0-14:   ✅ Clean (green)
  Score 15-49:  ⚠️ Flagged (yellow)
  Score 50-100: 🚨 High Risk (red) — payouts auto-held`}</Code>
              <p><strong className="text-foreground">Impact on Payroll:</strong> Flagged content has payouts set to "flagged" status. High-risk creators require manual review before payment release.</p>
            </Section>

            <Separator />

            {/* 10 */}
            <Section id="ai" title="10. AI Recommendation Engine">
              <p>Powered by <strong className="text-foreground">Google Gemini (via Lovable AI Gateway)</strong> — no API key required:</p>
              <div className="space-y-3">
                <div className="bg-muted/30 rounded-lg p-3 border border-border">
                  <p className="font-semibold text-foreground text-xs">Creator Recommendations</p>
                  <p className="text-xs mt-1">Analyzes campaign requirements + available creator profiles → recommends top 5 matches with reasoning (audience fit, engagement rate, platform alignment, content category)</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border">
                  <p className="font-semibold text-foreground text-xs">Posting Time Optimization</p>
                  <p className="text-xs mt-1">Analyzes historical engagement patterns → predicts best 3 posting times (day + hour) per platform for maximum reach</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border">
                  <p className="font-semibold text-foreground text-xs">Content Performance Prediction</p>
                  <p className="text-xs mt-1">Uses past performance data → forecasts expected views, engagement rate, and performance score for upcoming content</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border">
                  <p className="font-semibold text-foreground text-xs">Campaign Optimization</p>
                  <p className="text-xs mt-1">Reviews campaign metrics + creator performance → suggests 5 actionable improvements to increase ROI</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 border border-border">
                  <p className="font-semibold text-foreground text-xs">Brand Safety Analysis</p>
                  <p className="text-xs mt-1">Evaluates creator content topics + fraud indicators → assesses brand safety risk (0-100) with specific risk factors and mitigation strategies</p>
                </div>
              </div>
            </Section>

            <Separator />

            {/* 11 */}
            <Section id="payroll" title="11. Payroll Computation Engine">
              <Code>{`Final Payment Formula:
  Payment = BasePay × (PerfScore × MatchScore × Multiplier) + Bonuses

Where:
  BasePay     = Campaign default or per-creator override
  PerfScore   = Weighted algorithm output (0-1 normalized)
  MatchScore  = Audience quality score (0-1)
  Multiplier  = Brand's performance multiplier (default: 1.0)
  Bonuses     = Sum of milestone + virality + retention bonuses

Payout Lifecycle:
  pending → processing → paid | failed | flagged`}</Code>
              <p><strong className="text-foreground">Multi-Currency:</strong> Supports USD, EUR, GBP, CAD, AUD with converted_amount and converted_currency fields.</p>
              <p><strong className="text-foreground">Batch Processing:</strong> Multiple payroll records grouped into payout_batches with batch_number, payment method, and scheduled execution.</p>
              <p><strong className="text-foreground">Escrow:</strong> Campaign budgets can be locked in campaign_escrow. Payments draw from escrow — released_amount tracks disbursements.</p>
            </Section>

            <Separator />

            {/* 12 */}
            <Section id="payment" title="12. Payment Infrastructure">
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>PayPal Payouts API:</strong> Batch payments via PayPal mass pay. Requires PAYPAL_CLIENT_ID and PAYPAL_SECRET.</li>
                <li><strong>Wise (TransferWise):</strong> International transfers with competitive FX rates. Uses Wise API.</li>
                <li><strong>Bank Transfer:</strong> Direct ACH/wire using stored bank routing + account numbers.</li>
                <li><strong>Escrow System:</strong> Brand locks campaign budget → funds held until content delivered → released on approval or auto-release on paid status.</li>
                <li><strong>Tax Compliance:</strong> W-9 (US) and W-8BEN (international) form collection and verification. Generates 1099 forms for US creators earning {'>'} $600/year.</li>
              </ul>
            </Section>

            <Separator />

            {/* 13 */}
            <Section id="api" title="13. API Reference">
              <Code>{`// Submit Content Metrics
POST /functions/v1/submit-metrics
Body: {
  campaign_creator_id: "uuid",
  platform: "tiktok" | "instagram" | "youtube",
  content_url: "https://...",
  views: 150000,
  likes: 12000,
  comments: 800,
  shares: 3500,
  saves: 2100,
  watch_time_pct: 72.5,
  ctr: 3.2,
  conversion_rate: 1.8
}
Response: {
  content_id: "uuid",
  performance_score: 68.4,
  audience_match_score: 82.1,
  payout: {
    base_pay: 200,
    bonus: 50,
    total_payment: 312.50,
    status: "pending"
  }
}

// Analyze Fraud
POST /functions/v1/analyze-fraud
Body: { brand_id: "uuid" }
Response: {
  scanned: 45,
  flagged: 3,
  results: [{ creator_id, risk_score, indicators: [...] }]
}

// AI Recommendations  
POST /functions/v1/ai-recommendations
Body: {
  type: "recommend_creators" | "posting_time" | "content_prediction" | "campaign_optimization" | "brand_safety",
  context: { campaign: {...}, creators: [...] }
}
Response: { result: "AI analysis text..." }`}</Code>
            </Section>

            <Separator />

            {/* 14 */}
            <Section id="testing" title="14. Testing Strategy">
              <h3 className="text-base font-semibold text-foreground mt-2">Unit Tests</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Algorithm accuracy: Verify PerformanceScore and AudienceMatchScore calculations</li>
                <li>Payroll computation: Test formula with edge cases (0 views, max bonuses, multi-currency)</li>
                <li>Fraud detection: Test each indicator independently and combined scoring</li>
              </ul>

              <h3 className="text-base font-semibold text-foreground mt-4">Integration Tests</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Auth flow: Signup → brand creation → session persistence</li>
                <li>Content submission: Metrics in → score computed → payroll created</li>
                <li>Batch payout: Select payroll items → create batch → process → verify status updates</li>
                <li>Fraud scan: Add suspicious data → run scan → verify flagging</li>
              </ul>

              <h3 className="text-base font-semibold text-foreground mt-4">E2E Test Scenarios</h3>
              <Code>{`Scenario 1: Full Campaign Lifecycle
  1. Create campaign with budget $10,000
  2. Onboard 3 creators
  3. Assign creators to campaign
  4. Submit content for each creator
  5. Verify payroll computed correctly
  6. Process batch payout
  7. Verify campaign.spent updated

Scenario 2: Fraud Detection Flow
  1. Create creator with normal metrics
  2. Submit content with suspicious spikes
  3. Run fraud scan
  4. Verify creator flagged
  5. Verify payout held

Scenario 3: AI Recommendations
  1. Create campaign with target audience
  2. Add multiple creators with varying profiles
  3. Request creator recommendations
  4. Verify AI returns ranked list with reasoning`}</Code>
            </Section>

            <Separator />

            {/* 15 */}
            <Section id="security" title="15. Security & Compliance">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>RLS Everywhere:</strong> Every table has Row-Level Security. No data leaks between brands.</li>
                <li><strong>JWT Auth:</strong> All API calls authenticated via Supabase JWT tokens.</li>
                <li><strong>Edge Function Security:</strong> Functions validate authorization headers. Secrets stored in Supabase Vault.</li>
                <li><strong>Sensitive Data:</strong> Bank account numbers, SSNs stored with last-four-only pattern. Full values never returned to frontend.</li>
                <li><strong>CORS:</strong> Edge functions configured with proper CORS headers.</li>
                <li><strong>Input Validation:</strong> All user inputs validated server-side in Edge Functions.</li>
                <li><strong>GDPR:</strong> Creator data can be exported/deleted. Consent tracked. Data retention policies configurable.</li>
              </ul>
            </Section>

            <Separator />

            {/* 16 */}
            <Section id="deployment" title="16. Deployment & DevOps">
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Frontend:</strong> Deployed via Lovable's CDN. Automatic builds on code changes.</li>
                <li><strong>Edge Functions:</strong> Auto-deployed on push. No manual deployment needed.</li>
                <li><strong>Database Migrations:</strong> Managed via Supabase migration system. Version-controlled SQL.</li>
                <li><strong>Environment Variables:</strong> VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY auto-configured. Secrets (API keys) stored in Supabase Vault.</li>
                <li><strong>Monitoring:</strong> Edge function logs available. Auth logs tracked. Database query analytics via Supabase dashboard.</li>
              </ul>
            </Section>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
);

export default DevManual;
