import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Step = ({ num, title, children }: { num: number; title: string; children: React.ReactNode }) => (
  <div className="flex gap-4">
    <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
      {num}
    </div>
    <div className="flex-1 pb-6">
      <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  </div>
);

const Guide = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <Card className="overflow-hidden">
    <CardHeader className="bg-muted/30 border-b border-border">
      <CardTitle className="text-lg flex items-center gap-2">
        <span className="text-xl">{icon}</span> {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 space-y-1">{children}</CardContent>
  </Card>
);

const UserManual = () => (
  <DashboardLayout title="User Manual" subtitle="Simple step-by-step guide for everyone">
    <div className="max-w-4xl space-y-6">
      <Link to="/docs">
        <Button variant="ghost" size="sm" className="gap-2 text-xs mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to Docs
        </Button>
      </Link>

      {/* Welcome */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to CreatorPay! 👋</CardTitle>
          <CardDescription className="text-base">
            This guide will walk you through everything you need to know to use the platform. No technical knowledge required!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 border border-border text-center">
              <p className="text-2xl mb-2">🏢</p>
              <p className="text-sm font-semibold text-foreground">For Brands</p>
              <p className="text-xs text-muted-foreground mt-1">Create campaigns, manage creators, track performance</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border text-center">
              <p className="text-2xl mb-2">🎬</p>
              <p className="text-sm font-semibold text-foreground">For Creators</p>
              <p className="text-xs text-muted-foreground mt-1">Submit content, track earnings, get paid automatically</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border text-center">
              <p className="text-2xl mb-2">⚙️</p>
              <p className="text-sm font-semibold text-foreground">For Admins</p>
              <p className="text-xs text-muted-foreground mt-1">Monitor fraud, manage payouts, configure settings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Guide title="Getting Started" icon="🚀">
        <Step num={1} title="Create Your Account">
          <p>Go to the login page and click <strong className="text-foreground">"Don't have an account? Sign up"</strong>. Enter your email and a password (at least 6 characters). You can also sign in with Google for faster access.</p>
        </Step>
        <Step num={2} title="Your Brand is Auto-Created">
          <p>When you first sign in, your brand profile is automatically created using your email. You can change your company name and settings later in the <strong className="text-foreground">Settings</strong> page.</p>
        </Step>
        <Step num={3} title="Explore the Dashboard">
          <p>The <strong className="text-foreground">Overview</strong> page shows your key metrics at a glance: total spend, active campaigns, creator count, and engagement rates. Use the sidebar to navigate to different sections.</p>
        </Step>
      </Guide>

      <Separator />

      {/* Campaigns */}
      <Guide title="Creating & Managing Campaigns" icon="📢">
        <Step num={1} title="Go to Campaigns">
          <p>Click <strong className="text-foreground">"Campaigns"</strong> in the sidebar. You'll see all your campaigns (or "No campaigns yet" if you're new).</p>
        </Step>
        <Step num={2} title="Create a New Campaign">
          <p>Click the <strong className="text-foreground">"+ New Campaign"</strong> button. Fill in:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Campaign Name</strong> — Give it a clear, descriptive name</li>
            <li><strong>Budget</strong> — How much you want to spend total</li>
            <li><strong>Platforms</strong> — Which social media platforms to target</li>
            <li><strong>Start/End Date</strong> — When the campaign runs</li>
            <li><strong>Enable Escrow</strong> — Toggle this ON to lock your budget for payment protection</li>
          </ul>
        </Step>
        <Step num={3} title="Monitor Campaign Performance">
          <p>Click on any campaign to see detailed performance: assigned creators, content submissions, spending, and ROI metrics.</p>
        </Step>
      </Guide>

      <Separator />

      {/* Creators */}
      <Guide title="Adding & Managing Creators" icon="👥">
        <Step num={1} title="Onboard a New Creator">
          <p>Go to <strong className="text-foreground">"Onboarding"</strong> in the sidebar. Fill in the creator's details:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Full name and social media handle (e.g., @alexjohnson)</li>
            <li>Select which platforms they're active on</li>
            <li>Choose their content category (Gaming, Beauty, Tech, etc.)</li>
            <li>Enter their follower count and engagement rate</li>
            <li>Set audience demographics (age range, gender, countries)</li>
          </ul>
          <p>Click <strong className="text-foreground">"Onboard Creator"</strong> to add them.</p>
        </Step>
        <Step num={2} title="View All Creators">
          <p>Go to <strong className="text-foreground">"Creators"</strong> to see your full creator directory. Use the search bar to find creators by name or handle. Click "Filters" to narrow by platform or category.</p>
        </Step>
        <Step num={3} title="Set Up Payment Profile">
          <p>On the Creators page, click the <strong className="text-foreground">payment icon (💰)</strong> on a creator's card to set up their payment details — PayPal email, Wise account, or bank transfer information.</p>
        </Step>
      </Guide>

      <Separator />

      {/* Content */}
      <Guide title="Submitting Content & Getting Paid" icon="📊">
        <Step num={1} title="Go to Submit Content">
          <p>Click <strong className="text-foreground">"Submit Content"</strong> in the sidebar.</p>
        </Step>
        <Step num={2} title="Select the Campaign Assignment">
          <p>Choose which campaign-creator assignment this content belongs to from the dropdown.</p>
        </Step>
        <Step num={3} title="Enter Content Metrics">
          <p>Fill in the performance data from the social media platform:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Views</strong> — Total video/post views (required)</li>
            <li><strong>Likes</strong> — Number of likes (required)</li>
            <li><strong>Watch Time %</strong> — Average percentage watched (required)</li>
            <li><strong>Comments, Shares, Saves</strong> — Optional but improve your score</li>
          </ul>
        </Step>
        <Step num={4} title="Preview Your Payout">
          <p>Click <strong className="text-foreground">"Preview Payout"</strong> to see an estimate of your payment before submitting. The payout preview shows base pay, bonuses, and total.</p>
        </Step>
        <Step num={5} title="Submit & Calculate">
          <p>Click <strong className="text-foreground">"Submit & Calculate Payroll"</strong>. The system will score your content and create a payroll record. Your payment will appear in the Payroll section.</p>
        </Step>
      </Guide>

      <Separator />

      {/* Payroll */}
      <Guide title="Understanding Payroll & Payments" icon="💰">
        <Step num={1} title="How Payments are Calculated">
          <p>Your payment is based on a formula that considers:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Base Pay</strong> — Set by the campaign (e.g., $200)</li>
            <li><strong>Performance Score</strong> — How well your content performed (quality of engagement)</li>
            <li><strong>Audience Match</strong> — How well your viewers match the campaign's target audience</li>
            <li><strong>Bonuses</strong> — Extra money for hitting milestones (100K views = +$50, 1M views = +$500), going viral (high share rate = +$100), or high retention (80%+ watch time = +$75)</li>
          </ul>
        </Step>
        <Step num={2} title="Check Your Payroll Status">
          <p>Go to <strong className="text-foreground">"Payroll"</strong> to see all payment records. Each shows:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-emerald-400">Pending</strong> — Calculated, awaiting processing</li>
            <li><strong className="text-blue-400">Processing</strong> — Payment is being sent</li>
            <li><strong className="text-green-400">Paid</strong> — Money sent to your account</li>
            <li><strong className="text-yellow-400">Flagged</strong> — Held for fraud review</li>
          </ul>
        </Step>
        <Step num={3} title="Tax Documents">
          <p>Click <strong className="text-foreground">"Tax Docs"</strong> in the Payroll header to submit your W-9 (US) or W-8BEN (international) tax forms. These are required before receiving payments.</p>
        </Step>
      </Guide>

      <Separator />

      {/* Creator Dashboard */}
      <Guide title="Tracking Your Performance (Creator View)" icon="📈">
        <Step num={1} title="Open Creator View">
          <p>Click <strong className="text-foreground">"Creator View"</strong> in the sidebar.</p>
        </Step>
        <Step num={2} title="Select Your Profile">
          <p>Search for your name or handle in the dropdown. Your full dashboard will load showing:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Total Earned</strong> — All-time earnings across campaigns</li>
            <li><strong>Pending</strong> — Payments waiting to be processed</li>
            <li><strong>Total Views</strong> — Combined views across all content</li>
            <li><strong>Avg Performance Score</strong> — Your average content quality score</li>
          </ul>
        </Step>
        <Step num={3} title="Review Content History">
          <p>Scroll down to see all your submitted content with individual performance scores, audience match scores, and dates.</p>
        </Step>
      </Guide>

      <Separator />

      {/* Analytics */}
      <Guide title="Using Analytics" icon="📉">
        <Step num={1} title="Open Analytics">
          <p>Click <strong className="text-foreground">"Analytics"</strong> in the sidebar to see deep campaign insights.</p>
        </Step>
        <Step num={2} title="Read the Charts">
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Spend vs Views</strong> — Shows if you're getting more views as you spend more (good ROI)</li>
            <li><strong>Spend by Platform</strong> — Which platform gives best return</li>
            <li><strong>Audience Match Quality</strong> — Distribution of how well your content reaches the right people</li>
          </ul>
        </Step>
        <Step num={3} title="Export Data">
          <p>Click <strong className="text-foreground">"Export CSV"</strong> to download your analytics data for spreadsheets or reports.</p>
        </Step>
      </Guide>

      <Separator />

      {/* Fraud */}
      <Guide title="Fraud Detection" icon="🛡️">
        <Step num={1} title="Run a Scan">
          <p>Go to <strong className="text-foreground">"Fraud Detection"</strong> and click <strong className="text-foreground">"Run Full Scan"</strong>. The system will analyze all creators for suspicious activity.</p>
        </Step>
        <Step num={2} title="Review Results">
          <p>After scanning, you'll see:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-green-400">Verified Clean</strong> — No suspicious activity (score below 15)</li>
            <li><strong className="text-yellow-400">Flagged</strong> — Some unusual patterns detected (score 15-49)</li>
            <li><strong className="text-red-400">High Risk</strong> — Likely fake engagement (score 50+)</li>
          </ul>
        </Step>
        <Step num={3} title="Take Action">
          <p>Click on any flagged creator to see detailed indicators. Payments for high-risk creators are automatically held until reviewed.</p>
        </Step>
      </Guide>

      <Separator />

      {/* AI */}
      <Guide title="AI Insights" icon="🧠">
        <Step num={1} title="Open AI Insights">
          <p>Click <strong className="text-foreground">"AI Insights"</strong> in the sidebar. Choose from five analysis types using the tabs at the top.</p>
        </Step>
        <Step num={2} title="Get Creator Recommendations">
          <p>Select the <strong className="text-foreground">"Creators"</strong> tab, choose a campaign, and click <strong className="text-foreground">"Analyze"</strong>. The AI will recommend the best creators for your campaign with explanations.</p>
        </Step>
        <Step num={3} title="Explore Other AI Features">
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Timing</strong> — Best times to post for maximum engagement</li>
            <li><strong>Predict</strong> — Forecast content performance before publishing</li>
            <li><strong>Optimize</strong> — Get actionable tips to improve campaign ROI</li>
            <li><strong>Safety</strong> — Check if a creator is safe for your brand</li>
          </ul>
        </Step>
      </Guide>

      <Separator />

      {/* Settings */}
      <Guide title="Configuring Settings" icon="⚙️">
        <Step num={1} title="Update Your Brand Profile">
          <p>Go to <strong className="text-foreground">"Settings"</strong>. Here you can change:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Company name</li>
            <li>Industry</li>
            <li>Default base pay for new campaigns</li>
            <li>Default currency</li>
            <li>Performance multiplier</li>
          </ul>
        </Step>
        <Step num={2} title="Sign Out">
          <p>Click the <strong className="text-foreground">logout icon (→)</strong> at the bottom of the sidebar to sign out of your account.</p>
        </Step>
      </Guide>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-xl">❓</span> Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ["How is my payment calculated?", "Payment = Base Pay × (Performance Score × Audience Match × Multiplier) + any bonuses (milestone, virality, retention). Higher quality engagement and better audience targeting = higher payment."],
            ["What's a Performance Score?", "A number from 0-100 that measures the quality of your content's engagement. It considers watch time (30%), engagement rate (20%), shares (15%), saves (15%), comment quality (10%), and CTR (10%)."],
            ["What's an Audience Match Score?", "A number from 0-100 showing how well your actual viewers match the campaign's target audience (location, age, interests, gender, language)."],
            ["Why was my payment flagged?", "Our fraud detection system found unusual patterns in your engagement metrics. A team member will review your account. If the engagement is genuine, the payment will be released."],
            ["Which payment methods are supported?", "PayPal, Wise (TransferWise), and direct bank transfer. You can set your preferred method in your payment profile."],
            ["Do I need to submit tax forms?", "Yes, US-based creators need to submit a W-9 form. International creators submit a W-8BEN form. Go to Payroll → Tax Docs to complete this."],
            ["Which platforms are supported?", "TikTok, Instagram, YouTube, X (Twitter), and Twitch."],
          ].map(([q, a]) => (
            <div key={q}>
              <p className="text-sm font-semibold text-foreground">{q}</p>
              <p className="text-sm text-muted-foreground mt-1">{a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default UserManual;
