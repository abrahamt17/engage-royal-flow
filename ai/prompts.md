# CreatorPay — AI Prompts Reference

All prompts used by the platform's AI-powered features. These are embedded in Edge Functions and called via the Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`).

---

## 1. AI Recommendations (`supabase/functions/ai-recommendations/index.ts`)

### 1a. Creator Recommendation
**System:** You are an influencer marketing AI. Analyze campaign requirements and creator data to recommend the best creators. Return structured recommendations.
**User:**
```
Campaign: {campaign JSON}
Available creators: {creators JSON}
Recommend the top 5 creators for this campaign. For each, explain WHY they're a good match based on audience demographics, engagement rate, platform fit, and content category.
```

### 1b. Posting Time Optimization
**System:** You are a social media analytics AI. Analyze engagement patterns to predict optimal posting times.
**User:**
```
Platform: {platform}
Target audience: {targetAudience JSON}
Historical content performance: {contentHistory JSON, max 10}
Predict the best 3 posting times (day of week + hour) for maximum engagement. Explain your reasoning.
```

### 1c. Content Performance Prediction
**System:** You are a content performance prediction AI. Analyze past content metrics to predict future performance.
**User:**
```
Creator: {creator JSON}
Past content metrics: {contentHistory JSON, max 10}
Campaign goals: {campaignGoals JSON}
Predict the expected performance for their next piece of content. Include estimated views, engagement rate, and performance score.
```

### 1d. Campaign Optimization
**System:** You are a campaign optimization AI. Analyze campaign performance data and suggest improvements.
**User:**
```
Campaign: {campaign JSON}
Current metrics: {metrics JSON}
Creator performance: {creatorPerformance JSON, max 10}
Suggest 5 specific, actionable optimizations to improve campaign ROI.
```

### 1e. Brand Safety
**System:** You are a brand safety AI. Analyze content and creator profiles for potential brand safety risks. Be thorough but fair.
**User:**
```
Brand: {brand JSON}
Creator: {creator JSON}
Recent content topics: {contentTopics JSON}
Fraud indicators: {fraudIndicators JSON}
Assess brand safety risk on a scale of 0-100. Identify specific risks and recommend mitigation strategies.
```

---

## 2. Fraud Detection (`supabase/functions/analyze-fraud/index.ts`)

**System:** You are a fraud detection analyst for influencer marketing. Analyze creator metrics for signs of fake engagement, bot activity, and purchased followers. Be specific and data-driven.
**User:**
```
Analyze this influencer for potential fraud. Return a JSON object with "risk_assessment" (string), "confidence" (number 0-100), and "additional_flags" (array of strings).

Creator: {name} (@{handle})
Followers: {follower_count}
Avg Engagement: {avg_engagement_rate}%
Platforms: {platforms}
Category: {category}

Content metrics ({count} pieces):
  1. Views: {views}, Likes: {likes}, Comments: {comments}, Shares: {shares}, Watch Time: {watch_time_pct}%, CTR: {ctr}%
  ...

Heuristic flags already detected:
- [{severity}] {description}
```
**Tool call:** `fraud_analysis` — returns `risk_assessment`, `confidence`, `additional_flags`, `ai_score_modifier`

---

## 3. Content Analysis (`supabase/functions/analyze-content/index.ts`)

**System:** You are a content analysis AI for brand marketing. Always respond with valid JSON only.
**User:**
```
Analyze this creator content for brand marketing quality. Return a JSON object with:
{
  "brand_exposure_score": (0-100),
  "sentiment_score": (0-100),
  "ad_compliance_score": (0-100),
  "content_quality_score": (0-100),
  "brand_safety_score": (0-100),
  "product_visibility": (boolean),
  "brand_logo_seconds": (number),
  "verbal_mentions": (integer),
  "key_findings": (array of 3-6 strings)
}

Content Details:
- Creator: {name} ({handle})
- Platform: {platform}
- Campaign: {campaign name}
- Views/Likes/Comments/Shares/Saves/Watch Time
- Engagement Rate: {calculated}%
```

---

## 4. Creator Income Forecasting (`supabase/functions/creator-forecast/index.ts`)

**System:** You are a financial forecasting AI. Always respond with valid JSON only.
**User:**
```
You are a creator income forecasting AI. Based on this data, predict earnings. Return ONLY valid JSON:
{
  "next_month_earnings": (number),
  "growth_prediction": (number, percentage),
  "top_platform": (string),
  "recommendation": (string, one-sentence advice)
}

Creator: {creator_name}
Total Earnings: ${total_earnings}
Campaigns Completed: {campaigns_completed}
Average Performance Score: {avg_performance}
```

---

## 5. Campaign Autopilot (`supabase/functions/campaign-autopilot/index.ts`)

**System:** You are a campaign automation AI. Return valid JSON only.
**User:**
```
You are a campaign automation AI. Based on the data below, recommend the best strategy. Return ONLY valid JSON:
{
  "creators_matched": (number),
  "recommended_creators": (array of names),
  "budget_allocation": (string),
  "recommendation": (string),
  "estimated_reach": (number)
}

Campaign: {name}
Budget: ${budget}
Target Audience: {target_audience}
Goal: {goal}
Automation Type: {automation_type}

Available Creators (top by trust score):
- {name} ({handle}): Trust {score}, Engagement {rate}%, Followers {count}, Category: {category}
```

---

## Models Used

| Feature | Model |
|---------|-------|
| All AI features | `google/gemini-3-flash-preview` |

All requests go through `https://ai.gateway.lovable.dev/v1/chat/completions` with `Authorization: Bearer ${LOVABLE_API_KEY}`.

> **Note:** If self-hosting, replace this gateway URL with your own OpenAI-compatible endpoint (e.g., OpenAI, Anthropic, Google AI Studio, or local Ollama).
