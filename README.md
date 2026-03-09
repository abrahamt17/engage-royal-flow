# CreatorPay — AI-Powered Influencer Marketing & Payroll Platform

Full-stack SaaS platform for managing influencer marketing campaigns, performance-based payroll, fraud detection, and AI-powered analytics.

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (React)                │
│  Vite + TypeScript + Tailwind CSS + shadcn/ui   │
│  React Router · React Query · Recharts          │
└───────────────────────┬─────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────┐
│              Supabase Backend                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│  │ Auth     │ │ Postgres │ │ Edge Functions    ││
│  │ (JWT)    │ │ + RLS    │ │ (Deno runtime)   ││
│  └──────────┘ └──────────┘ └──────────────────┘│
│  ┌──────────┐ ┌──────────────────────────────┐  │
│  │ Realtime │ │ Storage                      │  │
│  └──────────┘ └──────────────────────────────┘  │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│              External Services                   │
│  AI Gateway (Gemini)  ·  PayPal Payouts API     │
└─────────────────────────────────────────────────┘
```

## ✨ Features (15 Modules)

| # | Module | Route | Description |
|---|--------|-------|-------------|
| 1 | **Creator Trust System** | `/creators`, `/creator/:id` | Weighted trust score (performance 30%, ratings 20%, fraud 15%, reliability 15%, authenticity 10%, completion 10%) |
| 2 | **Creator Marketplace** | `/marketplace` | Two-sided discovery with AI Fit Score, advanced filters |
| 3 | **Conversion Tracking** | `/conversions` | UTM/promo/affiliate attribution, CPA, ROAS |
| 4 | **AI Content Analysis** | `/content-analysis` | AI video quality, brand exposure, sentiment scoring |
| 5 | **Real-Time Monitor** | `/realtime` | Live performance alerts via Supabase Realtime |
| 6 | **Creator Forecasting** | `/forecasting` | AI earnings prediction & growth projection |
| 7 | **Campaign Automation** | `/automation` | AI autopilot for creator selection & budget |
| 8 | **Smart Dynamic Payroll** | `/smart-payroll` | Adaptive formula with tiered multipliers & viral bonuses |
| 9 | **Contract Automation** | `/contracts` | Auto-generated contracts, digital signatures, milestones |
| 10 | **Creator Portfolios** | `/creator/:id` | Public profile with stats, reviews, demographics |
| 11 | **Public API** | `/api-docs` | RESTful API for external integrations |
| 12 | **Influence Graph** | `/influence-graph` | Network analysis, audience overlap, centrality |
| 13 | **Global Compliance** | `/compliance` | US 1099, EU VAT/DAC7, UK IR35 tracking |
| 14 | **Creator Loyalty** | `/loyalty` | Tiered rewards (Bronze→Platinum) |
| 15 | **Benchmark Database** | `/benchmarks` | Industry metrics by platform & niche |

**Plus:** Campaigns, Analytics, Fraud Detection, AI Recommendations, Payroll/Escrow, Batch Payouts (PayPal), Content Submission, Creator Onboarding, Docs Hub.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase CLI (`npm install -g supabase`)
- A Supabase project (or local setup)

### Setup

```bash
# 1. Clone
git clone <YOUR_REPO_URL>
cd creatorpay

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# 4. Database
supabase db push              # apply migrations
# OR manually run: database/schema.sql then database/seed.sql

# 5. Edge Function secrets
supabase secrets set LOVABLE_API_KEY=<your-ai-key>
supabase secrets set PAYPAL_CLIENT_ID=<your-paypal-id>
supabase secrets set PAYPAL_CLIENT_SECRET=<your-paypal-secret>

# 6. Deploy edge functions
supabase functions deploy

# 7. Run dev server
npm run dev
```

## 📁 Project Structure

```
├── src/
│   ├── components/          # UI components (shadcn/ui based)
│   │   ├── dashboard/       # Layout, sidebar, stat cards, charts
│   │   ├── fraud/           # Fraud detection cards & dialogs
│   │   ├── marketplace/     # Creator trust dialog
│   │   ├── payroll/         # Batch, escrow, payment profile
│   │   └── ui/              # shadcn/ui primitives
│   ├── hooks/               # React Query hooks
│   │   ├── useAuth.tsx      # Auth context
│   │   ├── useData.ts       # Core data hooks
│   │   ├── useAdvancedData.ts
│   │   ├── useMarketplaceData.ts
│   │   ├── usePaymentData.ts
│   │   └── usePlatformData.ts
│   ├── pages/               # Route pages (30+ pages)
│   ├── integrations/        # Supabase client (auto-generated)
│   └── lib/                 # Utilities (csvExport, utils)
├── supabase/
│   ├── functions/           # 10 Edge Functions
│   │   ├── ai-recommendations/
│   │   ├── analyze-content/
│   │   ├── analyze-fraud/
│   │   ├── campaign-autopilot/
│   │   ├── creator-forecast/
│   │   ├── manage-creators/
│   │   ├── process-payouts/
│   │   ├── public-api/
│   │   ├── scheduled-payouts/
│   │   └── submit-metrics/
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase config
├── database/
│   ├── schema.sql           # Full database schema export
│   └── seed.sql             # Sample data
├── ai/
│   └── prompts.md           # All AI prompts reference
├── docs/
│   └── api.md               # API endpoint documentation
└── .env.example             # Environment template
```

## 🗄 Database Schema

19 tables with Row-Level Security. See [`database/schema.sql`](database/schema.sql) for the full schema.

**Core tables:** `brands`, `creators`, `campaigns`, `campaign_creators`, `creator_content`, `payroll`
**Financial:** `payout_batches`, `campaign_escrow`, `creator_payment_profiles`, `creator_tax_documents`
**AI/Analytics:** `content_analysis`, `performance_alerts`, `campaign_automations`, `conversion_tracking`
**Platform:** `brand_creator_ratings`, `creator_contracts`, `creator_loyalty`, `compliance_records`, `industry_benchmarks`

## 🔌 Edge Functions

| Function | Purpose |
|----------|---------|
| `submit-metrics` | Ingest content metrics & auto-calculate payroll |
| `analyze-fraud` | Heuristic + AI fraud detection |
| `analyze-content` | AI brand exposure & sentiment scoring |
| `ai-recommendations` | 5 AI recommendation types |
| `creator-forecast` | AI earnings prediction |
| `campaign-autopilot` | AI campaign automation |
| `process-payouts` | PayPal batch payouts + escrow |
| `scheduled-payouts` | Cron-based scheduled payout processing |
| `manage-creators` | Creator CRUD via service role |
| `public-api` | RESTful external API |

## 🔑 Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | `.env` | Frontend Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` | Frontend anon key |
| `LOVABLE_API_KEY` | Supabase secrets | AI Gateway auth |
| `PAYPAL_CLIENT_ID` | Supabase secrets | PayPal payouts |
| `PAYPAL_CLIENT_SECRET` | Supabase secrets | PayPal payouts |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secrets (auto) | Admin operations |

## 🎨 Design System

- **Framework:** Tailwind CSS with HSL design tokens
- **Components:** shadcn/ui with custom variants
- **Font:** Inter (300-800)
- **Theme:** Dark/light mode support
- **Charts:** Recharts with 5 chart colors

## 💳 Payment Integration

- **PayPal Batch Payouts** — sandbox & production
- **Multi-currency** — USD, EUR, GBP, CAD, AUD with conversion
- **Escrow** — fund/release campaign escrow
- **Scheduled payouts** — cron-triggered batch processing

## 🧪 Testing

```bash
npm run test        # Run tests
npm run test:watch  # Watch mode
```

## 📦 Deployment

```bash
npm run build       # Production build
npm run preview     # Preview production build
```

For Supabase:
```bash
supabase functions deploy   # Deploy all edge functions
supabase db push            # Push migrations
```

## 📄 License

Private — All rights reserved.
