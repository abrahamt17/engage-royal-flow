import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Users, Clock, TrendingUp, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { useCampaigns, useCreators, useCreatorContent } from "@/hooks/useData";
import { useBrand } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AIRecommendations = () => {
  const { data: campaigns = [] } = useCampaigns();
  const { data: creators = [] } = useCreators();
  const { data: content = [] } = useCreatorContent();
  const { data: brand } = useBrand();

  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  const runAI = async (type: string, context: any) => {
    setLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("ai-recommendations", {
        body: { type, context },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults((prev) => ({ ...prev, [type]: data.result }));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  };

  const campaign = campaigns.find((c) => c.id === selectedCampaign);

  return (
    <DashboardLayout title="AI Insights" subtitle="AI-powered recommendations and predictions">
      <Tabs defaultValue="creators" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="creators" className="text-xs"><Users className="h-3 w-3 mr-1" /> Creators</TabsTrigger>
          <TabsTrigger value="timing" className="text-xs"><Clock className="h-3 w-3 mr-1" /> Timing</TabsTrigger>
          <TabsTrigger value="prediction" className="text-xs"><TrendingUp className="h-3 w-3 mr-1" /> Predict</TabsTrigger>
          <TabsTrigger value="optimization" className="text-xs"><Sparkles className="h-3 w-3 mr-1" /> Optimize</TabsTrigger>
          <TabsTrigger value="safety" className="text-xs"><ShieldCheck className="h-3 w-3 mr-1" /> Safety</TabsTrigger>
        </TabsList>

        {/* Creator Recommendations */}
        <TabsContent value="creators">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Creator Recommendations
              </CardTitle>
              <CardDescription className="text-xs">Find the best creators for your campaign using AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => runAI("recommend_creators", {
                    campaign: campaign ? { name: campaign.name, platforms: campaign.platforms, content_type: campaign.content_type, target_audience: campaign.target_audience, budget: campaign.budget } : {},
                    creators: creators.slice(0, 20).map((c) => ({ name: c.name, handle: c.handle, platforms: c.platforms, category: c.category, follower_count: c.follower_count, avg_engagement_rate: c.avg_engagement_rate, fraud_risk_score: c.fraud_risk_score })),
                  })}
                  disabled={!selectedCampaign || loading === "recommend_creators"}
                >
                  {loading === "recommend_creators" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                  Analyze
                </Button>
              </div>
              {results.recommend_creators && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap text-xs text-card-foreground font-sans">{results.recommend_creators}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posting Time Prediction */}
        <TabsContent value="timing">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Best Posting Times
              </CardTitle>
              <CardDescription className="text-xs">Predict optimal posting times based on audience behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => runAI("posting_time", {
                    platform: campaign?.platforms?.[0] ?? "TikTok",
                    targetAudience: campaign?.target_audience ?? {},
                    contentHistory: content.slice(0, 10).map((c: any) => ({ views: c.views, likes: c.likes, created_at: c.created_at, platform: c.platform })),
                  })}
                  disabled={!selectedCampaign || loading === "posting_time"}
                >
                  {loading === "posting_time" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
                  Predict
                </Button>
              </div>
              {results.posting_time && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <pre className="whitespace-pre-wrap text-xs text-card-foreground font-sans">{results.posting_time}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Performance Prediction */}
        <TabsContent value="prediction">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Performance Prediction
              </CardTitle>
              <CardDescription className="text-xs">Predict expected content performance for creators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => runAI("content_prediction", {
                  creator: creators[0] ? { name: creators[0].name, platforms: creators[0].platforms, follower_count: creators[0].follower_count, avg_engagement_rate: creators[0].avg_engagement_rate } : {},
                  contentHistory: content.slice(0, 10).map((c: any) => ({ views: c.views, likes: c.likes, shares: c.shares, performance_score: c.performance_score, watch_time_pct: c.watch_time_pct })),
                  campaignGoals: campaign ? { budget: campaign.budget, platforms: campaign.platforms } : { budget: 10000, platforms: ["TikTok"] },
                })}
                disabled={creators.length === 0 || loading === "content_prediction"}
              >
                {loading === "content_prediction" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                Predict Performance
              </Button>
              {results.content_prediction && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <pre className="whitespace-pre-wrap text-xs text-card-foreground font-sans">{results.content_prediction}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Optimization */}
        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Campaign Optimization
              </CardTitle>
              <CardDescription className="text-xs">AI-powered suggestions to improve campaign ROI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => runAI("campaign_optimization", {
                    campaign: campaign ? { name: campaign.name, budget: campaign.budget, spent: campaign.spent, platforms: campaign.platforms, status: campaign.status } : {},
                    metrics: { totalContent: content.length, avgViews: content.reduce((s: number, c: any) => s + (c.views ?? 0), 0) / (content.length || 1) },
                    creatorPerformance: content.slice(0, 10).map((c: any) => ({ views: c.views, performance_score: c.performance_score, audience_match_score: c.audience_match_score })),
                  })}
                  disabled={!selectedCampaign || loading === "campaign_optimization"}
                >
                  {loading === "campaign_optimization" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Optimize
                </Button>
              </div>
              {results.campaign_optimization && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <pre className="whitespace-pre-wrap text-xs text-card-foreground font-sans">{results.campaign_optimization}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Safety */}
        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Brand Safety Analysis
              </CardTitle>
              <CardDescription className="text-xs">Assess brand safety risks for creator partnerships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => runAI("brand_safety", {
                  brand: brand ? { company_name: brand.company_name, industry: brand.industry } : {},
                  creator: creators[0] ? { name: creators[0].name, category: creators[0].category, platforms: creators[0].platforms } : {},
                  contentTopics: content.slice(0, 5).map((c: any) => c.platform),
                  fraudIndicators: creators[0]?.fraud_indicators ?? [],
                })}
                disabled={creators.length === 0 || loading === "brand_safety"}
              >
                {loading === "brand_safety" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                Analyze Safety
              </Button>
              {results.brand_safety && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <pre className="whitespace-pre-wrap text-xs text-card-foreground font-sans">{results.brand_safety}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AIRecommendations;