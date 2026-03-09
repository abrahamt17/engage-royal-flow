import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const CopyBlock = ({ title, content }: { title: string; content: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-muted/30 border border-border rounded-lg p-5 relative group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">{title}</p>
        <Button variant="ghost" size="sm" onClick={copy} className="h-7 gap-1.5 text-xs opacity-60 group-hover:opacity-100">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
};

const QuickSocial = () => (
  <DashboardLayout title="Quick Reference & Social Media Kit" subtitle="One-pagers, elevator pitches, and ready-to-post content">
    <div className="max-w-4xl space-y-6">
      <Link to="/docs">
        <Button variant="ghost" size="sm" className="gap-2 text-xs mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to Docs
        </Button>
      </Link>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>📄 One-Page Quick Reference</CardTitle>
          <CardDescription>Everything you need to know in 60 seconds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">What is CreatorPay?</h3>
            <p className="text-sm text-muted-foreground">An AI-powered SaaS platform that automates influencer marketing payments. Brands create campaigns, creators submit content, and the platform automatically scores performance, detects fraud, and processes payments — all based on quality of engagement, not just raw views.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 border border-border text-center">
              <p className="text-2xl font-black text-primary">6</p>
              <p className="text-xs text-muted-foreground mt-1">Edge Functions</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border text-center">
              <p className="text-2xl font-black text-primary">10</p>
              <p className="text-xs text-muted-foreground mt-1">Database Tables</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border text-center">
              <p className="text-2xl font-black text-primary">5</p>
              <p className="text-xs text-muted-foreground mt-1">AI Analysis Modes</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Core Features</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Campaign Management", "Creator Onboarding", "Performance Scoring",
                "Audience Matching", "Automated Payroll", "Multi-Currency Payments",
                "Fraud Detection (ML)", "AI Recommendations", "Escrow System",
                "Tax Compliance", "Batch Payouts", "Real-time Analytics"
              ].map((f) => (
                <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Tech Stack</h3>
            <p className="text-sm text-muted-foreground">React 18 + TypeScript + Tailwind CSS + Supabase (PostgreSQL + Auth + Edge Functions) + Google Gemini AI + Recharts</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">How Payment Works</h3>
            <p className="text-sm text-muted-foreground font-mono bg-muted/50 p-3 rounded-lg">
              Payment = BasePay × (PerfScore × AudienceMatch × Multiplier) + Milestone + Virality + Retention Bonuses
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">Platforms Supported</h3>
            <div className="flex gap-2">
              <Badge>TikTok</Badge>
              <Badge>Instagram</Badge>
              <Badge>YouTube</Badge>
              <Badge>X / Twitter</Badge>
              <Badge>Twitch</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Social Media Posts */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Social Media Posts (Ready to Copy)</CardTitle>
          <CardDescription>Pre-written posts for LinkedIn, Twitter/X, Instagram, and Product Hunt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <CopyBlock
            title="LinkedIn Post"
            content={`🚀 Introducing CreatorPay — The Future of Influencer Payments

We built an AI-powered platform that transforms how brands pay content creators.

Instead of paying based on raw views, CreatorPay uses a proprietary scoring engine that evaluates:

✅ Quality of engagement (watch time, shares, saves — not just likes)
✅ Audience relevance (are the right people watching?)
✅ Content authenticity (ML-powered fraud detection)

The result? Creators get paid fairly for genuine impact. Brands get better ROI.

Key features:
• Automated payroll with configurable formulas
• Multi-currency payments (PayPal, Wise, Bank Transfer)
• AI-powered creator recommendations
• Real-time campaign analytics
• Tax compliance (W-9/W-8BEN)
• Escrow system for budget protection

Built with React, TypeScript, Supabase, and Google Gemini AI.

Supporting TikTok, Instagram, YouTube, X/Twitter, and Twitch.

#InfluencerMarketing #SaaS #AI #CreatorEconomy #MarTech #Startup`}
          />

          <CopyBlock
            title="Twitter/X Thread (Post 1 of 4)"
            content={`🧵 We built CreatorPay — an AI platform that automatically pays creators based on QUALITY, not just views.

Here's how it works 👇

1/ Brands create campaigns with specific target audiences
2/ Creators submit content with engagement metrics
3/ Our algorithm scores performance across 6 weighted dimensions
4/ Audience match is computed against campaign targets
5/ Payment = BasePay × (Performance × AudienceMatch × Multiplier) + Bonuses

No more guessing. No more overpaying for fake engagement.`}
          />

          <CopyBlock
            title="Twitter/X Thread (Post 2 of 4)"
            content={`2/ The Performance Score breaks down like this:

• 30% Watch Time Completion
• 20% Engagement Rate
• 15% Share Rate  
• 15% Save Rate
• 10% Comment Quality
• 10% Click-Through Rate

A video with 1M views but 5% watch time scores LOWER than 100K views with 80% watch time.

Quality > Quantity.`}
          />

          <CopyBlock
            title="Twitter/X Thread (Post 3 of 4)"
            content={`3/ But what about fake engagement? 🤖

Our ML fraud detection analyzes:
• Engagement velocity spikes
• Bot comment patterns
• Suspicious follower growth
• Geographic anomalies

Creators with fraud scores > 50 get payments auto-held.

We also have AI-powered brand safety analysis via Google Gemini.`}
          />

          <CopyBlock
            title="Twitter/X Thread (Post 4 of 4)"
            content={`4/ The full stack:

Frontend: React 18 + TypeScript + Tailwind
Backend: Supabase (PostgreSQL + Edge Functions)
AI: Google Gemini for recommendations
Payments: PayPal + Wise + Bank Transfer
Security: Row-Level Security on every table

Supporting TikTok, Instagram, YouTube, X, and Twitch.

Try it out → [link]

#CreatorEconomy #SaaS #BuildInPublic`}
          />

          <CopyBlock
            title="Instagram Caption"
            content={`🎬 Meet CreatorPay — where creators get paid for REAL impact.

We're building the future of influencer payments with AI-powered scoring, fraud detection, and automated payroll.

No more flat rates. No more guessing. Just fair, performance-based compensation.

✨ Smart Performance Scoring
🎯 Audience Quality Matching
🤖 ML Fraud Detection
💰 Automated Multi-Currency Payouts
📊 Real-time Analytics
🧠 AI-Powered Recommendations

Supporting TikTok • Instagram • YouTube • X • Twitch

Built by creators, for the creator economy. 🚀

#CreatorPay #InfluencerMarketing #CreatorEconomy #SaaS #AI #MarTech #Startup #TechStartup`}
          />

          <CopyBlock
            title="Product Hunt Tagline"
            content={`CreatorPay — AI-powered influencer payments based on quality, not just views. Automated scoring, fraud detection, and multi-currency payouts for the creator economy.`}
          />

          <CopyBlock
            title="Elevator Pitch (30 seconds)"
            content={`CreatorPay is an AI-powered platform that automates how brands pay content creators. Instead of flat rates or raw view counts, we use a proprietary algorithm that scores content quality and audience relevance — then automatically calculates and processes payments. We also detect fake engagement with ML-based fraud analysis. Think of it as "smart payroll for influencer marketing" — fair for creators, efficient for brands.`}
          />

          <CopyBlock
            title="Press Release Paragraph"
            content={`CreatorPay, a next-generation influencer marketing platform, today announced the launch of its AI-powered creator compensation engine. The platform uses advanced algorithms to evaluate content performance across six weighted dimensions — including watch time, engagement quality, and click-through rates — while simultaneously scoring audience relevance against campaign targets. Combined with machine learning-based fraud detection and automated multi-currency payment processing via PayPal, Wise, and direct bank transfer, CreatorPay represents a fundamental shift from subjective influencer pricing to data-driven, performance-based compensation. The platform currently supports campaigns across TikTok, Instagram, YouTube, X/Twitter, and Twitch.`}
          />

        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default QuickSocial;
