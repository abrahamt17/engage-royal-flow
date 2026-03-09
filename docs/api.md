# CreatorPay API Documentation

Base URL: `https://<SUPABASE_PROJECT_ID>.supabase.co/functions/v1`

All endpoints require `Authorization: Bearer <SUPABASE_ANON_KEY>` header (or user JWT for authenticated routes).

---

## Public API (`/public-api`)

RESTful read API for integrations.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public-api?resource=campaigns` | List all campaigns |
| GET | `/public-api?resource=campaigns&id={id}` | Get campaign by ID |
| GET | `/public-api?resource=creators` | List creators (filterable) |
| GET | `/public-api?resource=creators&id={id}` | Get creator by ID |
| GET | `/public-api?resource=payroll` | List payroll entries |
| GET | `/public-api?resource=analytics` | Aggregated analytics summary |
| GET | `/public-api?resource=fraud` | Fraud risk scores |
| GET | `/public-api?resource=benchmarks` | Industry benchmarks |

**Query Params:** `limit` (default 50), `offset` (default 0)
**Creator Filters:** `category`, `platform`, `min_engagement`

---

## Submit Metrics (`/submit-metrics`)

Submit creator content and auto-calculate payroll.

```json
POST /submit-metrics
{
  "campaign_creator_id": "uuid",
  "platform": "tiktok",
  "views": 150000,
  "likes": 12000,
  "comments": 340,
  "shares": 890,
  "saves": 450,
  "watch_time_pct": 72.5,
  "content_url": "https://tiktok.com/..."
}
```

**Response:** `{ success, content, payroll, bonusBreakdown }`

### Payroll Formula
```
perfScore = weighted(watchTime×0.30, engagement×0.20, shareRate×0.15, saveRate×0.15, commentRate×0.10, viewScale×0.10)
totalPayment = basePay × (perfScore/100 × matchScore × multiplier) + bonus
```

### Bonus Tiers
- 1M+ views → 50% base bonus
- 500K+ views → 25%
- 100K+ views → 10%
- 5%+ share rate → 30% virality bonus
- 80%+ watch time → 20% retention bonus

---

## Fraud Analysis (`/analyze-fraud`)

```json
POST /analyze-fraud
{
  "creator_id": "uuid",        // scan single creator
  "scan_all": true,            // or scan all creators
  "dismiss": false             // reset fraud score
}
```

**Response:** `{ success, results: [{ creator_id, name, previous_score, new_score, indicators_count, ai_analysis }] }`

### Heuristic Checks
- Engagement-to-follower anomaly
- Dead followers detection
- View spike analysis
- Bot comment patterns
- Like-to-view ratio
- Watch time vs engagement mismatch

---

## Content Analysis (`/analyze-content`)

AI-powered brand content quality analysis.

```json
POST /analyze-content
{
  "content_id": "uuid",
  "description": "Optional content description"
}
```

**Response:** `{ success, analysis: { brand_exposure_score, sentiment_score, ad_compliance_score, content_quality_score, brand_safety_score, product_visibility, brand_logo_seconds, verbal_mentions, key_findings } }`

---

## AI Recommendations (`/ai-recommendations`)

```json
POST /ai-recommendations
{
  "type": "recommend_creators | posting_time | content_prediction | campaign_optimization | brand_safety",
  "context": { /* varies by type */ }
}
```

**Types:**
- `recommend_creators` — context: `{ campaign, creators }`
- `posting_time` — context: `{ platform, targetAudience, contentHistory }`
- `content_prediction` — context: `{ creator, contentHistory, campaignGoals }`
- `campaign_optimization` — context: `{ campaign, metrics, creatorPerformance }`
- `brand_safety` — context: `{ brand, creator, contentTopics, fraudIndicators }`

---

## Creator Forecast (`/creator-forecast`)

```json
POST /creator-forecast
{
  "creator_name": "Alex Tech",
  "total_earnings": 15000,
  "campaigns_completed": 12,
  "avg_performance": 78
}
```

**Response:** `{ success, forecast: { next_month_earnings, growth_prediction, top_platform, recommendation } }`

---

## Campaign Autopilot (`/campaign-autopilot`)

```json
POST /campaign-autopilot
{
  "campaign_id": "uuid",
  "brand_id": "uuid",
  "automation_type": "creator_selection",
  "config": {
    "budget": 20000,
    "target_audience": "US college students",
    "goal": "100k app installs"
  }
}
```

**Response:** `{ success, automation, results: { creators_matched, recommended_creators, budget_allocation, recommendation, estimated_reach } }`

---

## Process Payouts (`/process-payouts`)

### Create Batch
```json
POST /process-payouts
{
  "action": "create_batch",
  "brandId": "uuid",
  "payrollIds": ["uuid1", "uuid2"],
  "paymentMethod": "paypal",
  "scheduledFor": "2026-04-01T00:00:00Z"  // optional
}
```

### Process Batch (Execute PayPal Payout)
```json
POST /process-payouts
{
  "action": "process_batch",
  "batchId": "uuid"
}
```

### Fund Escrow
```json
POST /process-payouts
{ "action": "fund_escrow", "campaignId": "uuid", "amount": 10000, "currency": "USD" }
```

### Release Escrow
```json
POST /process-payouts
{ "action": "release_escrow", "escrowId": "uuid", "releaseAmount": 5000 }
```

---

## Manage Creators (`/manage-creators`)

```json
POST /manage-creators
{
  "action": "create",
  "creator": {
    "name": "Alex Tech",
    "handle": "@alextech",
    "platforms": ["tiktok", "youtube"],
    "category": "tech",
    "follower_count": 250000,
    "avg_engagement_rate": 6.5,
    "audience_demographics": {}
  }
}
```

---

## Scheduled Payouts (`/scheduled-payouts`)

Cron-triggered function. Finds all `payout_batches` with `status=scheduled` and `scheduled_for <= now()`, then processes them via PayPal.

```json
POST /scheduled-payouts
{}
```

---

## Error Responses

All endpoints return errors as:
```json
{ "error": "Error message" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / missing params |
| 402 | AI credits exhausted |
| 429 | Rate limited |
| 500 | Server error |
