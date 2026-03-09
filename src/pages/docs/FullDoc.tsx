import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Chapter = ({ num, title, children }: { num: number; title: string; children: React.ReactNode }) => (
  <section className="scroll-mt-24">
    <div className="flex items-baseline gap-3 mb-4">
      <span className="text-3xl font-black text-primary/20">{String(num).padStart(2, "0")}</span>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
    </div>
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-12">{children}</div>
  </section>
);

const FullDoc = () => (
  <DashboardLayout title="Full Platform Documentation" subtitle="Comprehensive reference for every module and feature">
    <div className="max-w-4xl space-y-6">
      <Link to="/docs">
        <Button variant="ghost" size="sm" className="gap-2 text-xs mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to Docs
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">CreatorPay — Full Platform Documentation</CardTitle>
          <CardDescription>Version 1.0 · Last updated March 2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">

          <Chapter num={1} title="Executive Summary">
            <p>CreatorPay is an AI-powered SaaS platform that automates the entire influencer marketing payment lifecycle — from campaign creation and creator onboarding to performance scoring, fraud detection, and automated multi-currency payouts.</p>
            <p>Unlike traditional influencer platforms that pay based on raw view counts, CreatorPay uses a proprietary scoring engine that evaluates <strong className="text-foreground">quality of engagement</strong> (watch time, shares, saves, CTR) and <strong className="text-foreground">audience relevance</strong> (demographic matching against campaign targets). This ensures creators are rewarded for genuine, high-quality content that reaches the right audience.</p>
            <p>The platform supports brands running campaigns across TikTok, Instagram, YouTube, X/Twitter, and Twitch with real-time analytics, AI-powered recommendations, and full tax compliance.</p>
          </Chapter>

          <Separator />

          <Chapter num={2} title="Platform Modules">
            <h3 className="text-base font-semibold text-foreground">2.1 Brand Dashboard (Overview)</h3>
            <p>The main dashboard provides an at-a-glance view of a brand's influencer marketing operations:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Total Spend</strong> — Cumulative campaign expenditure</li>
              <li><strong>Creators Available</strong> — Number of creators in the marketplace</li>
              <li><strong>Active Campaigns</strong> — Currently running campaigns</li>
              <li><strong>Average Engagement</strong> — Weighted engagement across all content</li>
              <li><strong>Spend vs Views Chart</strong> — Line chart showing ROI trends over time</li>
              <li><strong>Audience Match Quality</strong> — Distribution of audience match scores</li>
              <li><strong>Recent Campaigns Table</strong> — Quick access to campaign details</li>
              <li><strong>Top Performing Creators</strong> — Leaderboard ranked by performance score</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6">2.2 Campaign Management</h3>
            <p>Campaigns are the core organizational unit. Each campaign defines:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Basic Info:</strong> Name, budget, date range, status</li>
              <li><strong>Platform Targeting:</strong> Which social platforms to target (multi-select)</li>
              <li><strong>Content Type:</strong> Video, Reel, Post, Story</li>
              <li><strong>Target Audience (JSONB):</strong> Age range, gender, country/region, interests, language, income proxy, device type</li>
              <li><strong>Payroll Formula (JSONB):</strong> Base pay, performance multiplier, conversion bonus, engagement bonus thresholds</li>
              <li><strong>Escrow Option:</strong> Lock budget funds before campaign starts</li>
            </ul>
            <p>Campaign lifecycle: <Badge variant="outline">Draft</Badge> → <Badge variant="outline">Active</Badge> → <Badge variant="outline">Paused</Badge> → <Badge variant="outline">Completed</Badge></p>

            <h3 className="text-base font-semibold text-foreground mt-6">2.3 Creator Management</h3>
            <p>The Creators page provides a searchable, filterable directory of all creators with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Search by name or handle</li>
              <li>Filter by platform, category, engagement rate range</li>
              <li>Fraud risk indicators (green/yellow/red badges)</li>
              <li>Payment profile management (PayPal, Wise, Bank)</li>
              <li>CSV export for reporting</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6">2.4 Creator Onboarding</h3>
            <p>A structured form to add new creators to the platform:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Identity:</strong> Full name, social handle</li>
              <li><strong>Platforms:</strong> TikTok, Instagram, YouTube, X/Twitter, Twitch (checkbox multi-select)</li>
              <li><strong>Profile:</strong> Content category, follower count, engagement rate</li>
              <li><strong>Audience Demographics:</strong> Age range, gender split, top countries</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6">2.5 Content Submission</h3>
            <p>After creators publish content, metrics are submitted through a dedicated form:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Select campaign assignment</li>
              <li>Choose platform and enter content URL</li>
              <li>Input engagement metrics: Views*, Likes*, Watch Time%*, Comments, Shares, Saves</li>
              <li>Optional: CTR, Conversion Rate</li>
              <li>"Preview Payout" shows estimated payment before submission</li>
              <li>"Submit & Calculate Payroll" processes through the scoring engine</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6">2.6 Creator Dashboard</h3>
            <p>A dedicated view for reviewing individual creator performance:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Creator profile header with avatar, handle, platforms, category</li>
              <li>Stat cards: Total Earned, Pending Payments, Total Views, Avg Performance Score</li>
              <li>Content Performance table: All submitted content with scores</li>
              <li>Payout History table: All payroll records with status</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6">2.7 Analytics</h3>
            <p>Deep analytics across all campaigns:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Total Views, Avg Watch Time, Total Shares, Avg CTR stat cards</li>
              <li>Spend vs Views line chart</li>
              <li>Spend by Platform bar chart</li>
              <li>Audience Match Quality distribution</li>
              <li>Campaign comparison table</li>
              <li>CSV export for all data</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6">2.8 Payroll</h3>
            <p>Automated payment management:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payroll records table with computed payments</li>
              <li>Status tracking: pending → processing → paid/failed/flagged</li>
              <li>Batch payout creation (select multiple, create batch)</li>
              <li>Scheduled payouts (set future date for auto-processing)</li>
              <li>Escrow panel showing locked and released funds</li>
              <li>Batch history with processing results</li>
              <li>Tax documentation management (W-9, W-8BEN forms)</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6">2.9 Fraud Detection</h3>
            <p>ML-powered engagement authenticity system:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>"Run Full Scan" button triggers analyze-fraud Edge Function</li>
              <li>Stats: Total Creators, Flagged, High Risk, Verified Clean</li>
              <li>Flagged Accounts list with expandable detail cards</li>
              <li>Each card shows: fraud score, specific indicators, engagement history</li>
              <li>Export flagged accounts for review</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6">2.10 AI Insights</h3>
            <p>Five AI-powered analysis modes:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Creator Recommendations:</strong> AI suggests best creators for a campaign</li>
              <li><strong>Posting Time Optimization:</strong> Predicts optimal posting schedule</li>
              <li><strong>Content Performance Prediction:</strong> Forecasts metrics for upcoming content</li>
              <li><strong>Campaign Optimization:</strong> Actionable suggestions to improve ROI</li>
              <li><strong>Brand Safety:</strong> Risk assessment for creator-brand partnerships</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-6">2.11 Settings</h3>
            <p>Brand profile configuration: company name, industry, default base pay, currency, and performance multiplier.</p>
          </Chapter>

          <Separator />

          <Chapter num={3} title="Scoring Algorithms">
            <p>CreatorPay's differentiation lies in paying creators based on <strong className="text-foreground">quality and relevance</strong>, not just raw numbers.</p>
            <p><strong className="text-foreground">Performance Score (0-100):</strong> Weighted combination of watch time completion (30%), engagement rate (20%), share rate (15%), save rate (15%), comment quality (10%), and click-through rate (10%).</p>
            <p><strong className="text-foreground">Audience Match Score (0-100):</strong> Measures how well the actual viewers match the campaign's target audience across location (35%), age (25%), interests (20%), gender (10%), and language (10%).</p>
            <p><strong className="text-foreground">Combined Impact:</strong> Both scores multiply together in the payroll formula, meaning a creator with high engagement but poor audience fit will earn less than one with moderate engagement but perfect audience alignment.</p>
          </Chapter>

          <Separator />

          <Chapter num={4} title="Payment System">
            <p>The platform supports a full payment lifecycle:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Payment Methods:</strong> PayPal, Wise (TransferWise), Direct Bank Transfer</li>
              <li><strong>Multi-Currency:</strong> USD, EUR, GBP, CAD, AUD with automatic conversion</li>
              <li><strong>Escrow:</strong> Campaign budgets locked before start → released as content is approved</li>
              <li><strong>Batch Processing:</strong> Group multiple payments → process together → track with batch number</li>
              <li><strong>Scheduled Payouts:</strong> Set future date → pg_cron auto-triggers processing</li>
              <li><strong>Tax Compliance:</strong> W-9/W-8BEN collection, verification, and 1099 generation</li>
            </ul>
          </Chapter>

          <Separator />

          <Chapter num={5} title="Fraud Detection">
            <p>Five fraud signals analyzed per creator:</p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Engagement velocity spikes (unnatural growth in short periods)</li>
              <li>Bot-like comment patterns (generic, repetitive, or spam)</li>
              <li>Suspicious follower growth (sudden jumps without content)</li>
              <li>Geographic anomalies (engagement from unexpected regions)</li>
              <li>Engagement-to-follower ratio outliers</li>
            </ol>
            <p>Risk scores: 0-14 = Clean, 15-49 = Flagged, 50+ = High Risk (auto-holds payments).</p>
          </Chapter>

          <Separator />

          <Chapter num={6} title="AI Capabilities">
            <p>Powered by Google Gemini via Lovable AI Gateway. No external API key required.</p>
            <p>Five analysis modes: Creator Matching, Posting Time Optimization, Content Performance Prediction, Campaign Optimization, and Brand Safety Assessment. Each uses campaign and creator context to generate actionable insights.</p>
          </Chapter>

          <Separator />

          <Chapter num={7} title="Security & Data Privacy">
            <ul className="list-disc pl-6 space-y-1">
              <li>Row-Level Security on all database tables</li>
              <li>JWT-based authentication with session management</li>
              <li>Sensitive data (SSN, bank numbers) stored as last-four only</li>
              <li>Edge Functions validate all inputs server-side</li>
              <li>CORS properly configured on all endpoints</li>
              <li>GDPR-ready: data export and deletion capabilities</li>
            </ul>
          </Chapter>

          <Separator />

          <Chapter num={8} title="Supported Platforms">
            <div className="flex gap-2 flex-wrap">
              <Badge>TikTok</Badge>
              <Badge>Instagram</Badge>
              <Badge>YouTube</Badge>
              <Badge>X / Twitter</Badge>
              <Badge>Twitch</Badge>
            </div>
            <p className="mt-2">Each platform supports platform-specific metric collection. The scoring engine normalizes metrics across platforms for fair comparison.</p>
          </Chapter>

          <Separator />

          <Chapter num={9} title="Glossary">
            <div className="space-y-2">
              {[
                ["Performance Score", "Weighted algorithm output (0-100) measuring content quality based on engagement metrics"],
                ["Audience Match Score", "Measure (0-100) of how well actual viewers match campaign target demographics"],
                ["Fraud Risk Score", "ML-computed score (0-100) indicating likelihood of fake engagement"],
                ["Escrow", "Locked campaign funds held until content deliverables are approved"],
                ["Batch Payout", "Group of payments processed together in a single transaction batch"],
                ["Payroll Formula", "Configurable per-campaign formula: BasePay × (PerfScore × MatchScore × Multiplier) + Bonuses"],
                ["Edge Function", "Serverless backend function running on Deno, auto-deployed"],
                ["RLS", "Row-Level Security — database-level access control ensuring data isolation between brands"],
              ].map(([term, def]) => (
                <div key={term} className="flex gap-2">
                  <strong className="text-foreground min-w-[180px] shrink-0">{term}:</strong>
                  <span>{def}</span>
                </div>
              ))}
            </div>
          </Chapter>

        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default FullDoc;
