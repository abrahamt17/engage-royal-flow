import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, BarChart3, Sparkles, Loader2, Calendar } from "lucide-react";
import { useCampaignCreators, usePayroll, useCreatorContent } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreatorForecasting = () => {
  const { data: campaignCreators = [] } = useCampaignCreators();
  const { data: payroll = [] } = usePayroll();
  const { data: content = [] } = useCreatorContent();
  const [forecasting, setForecasting] = useState(false);
  const [forecasts, setForecasts] = useState<Record<string, any>>({});

  // Group earnings by creator
  const creatorEarnings: Record<string, { name: string; handle: string; total: number; campaigns: number; avgPerf: number; topPlatform: string }> = {};
  
  payroll.forEach((p: any) => {
    const cc = p.campaign_creators;
    if (!cc?.creators) return;
    const cid = cc.creator_id;
    if (!creatorEarnings[cid]) {
      creatorEarnings[cid] = { name: cc.creators.name, handle: cc.creators.handle, total: 0, campaigns: 0, avgPerf: 0, topPlatform: "TikTok" };
    }
    creatorEarnings[cid].total += p.total_payment || 0;
    creatorEarnings[cid].campaigns += 1;
    creatorEarnings[cid].avgPerf += p.perf_score || 0;
  });

  Object.keys(creatorEarnings).forEach((cid) => {
    const ce = creatorEarnings[cid];
    ce.avgPerf = ce.campaigns > 0 ? ce.avgPerf / ce.campaigns : 0;
  });

  // Platform analysis from content
  const platformCounts: Record<string, number> = {};
  content.forEach((c: any) => {
    platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1;
  });

  const handleForecast = async (creatorId: string, creatorName: string) => {
    setForecasting(true);
    try {
      const earnings = creatorEarnings[creatorId];
      const { data, error } = await supabase.functions.invoke("creator-forecast", {
        body: {
          creator_name: creatorName,
          total_earnings: earnings?.total || 0,
          campaigns_completed: earnings?.campaigns || 0,
          avg_performance: earnings?.avgPerf || 0,
        },
      });
      if (error) throw error;
      setForecasts((prev) => ({ ...prev, [creatorId]: data.forecast }));
      toast.success(`Forecast generated for ${creatorName}`);
    } catch (e: any) {
      toast.error(e.message || "Forecast failed");
    } finally {
      setForecasting(false);
    }
  };

  const creatorsArray = Object.entries(creatorEarnings).sort((a, b) => b[1].total - a[1].total);

  return (
    <DashboardLayout title="Income Forecasting" subtitle="AI-powered creator earnings predictions">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Total Paid Out</span>
            </div>
            <p className="text-2xl font-bold">${payroll.reduce((s: number, p: any) => s + (p.total_payment || 0), 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Active Creators</span>
            </div>
            <p className="text-2xl font-bold">{creatorsArray.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Avg Performance</span>
            </div>
            <p className="text-2xl font-bold">
              {creatorsArray.length > 0
                ? (creatorsArray.reduce((s, [, e]) => s + e.avgPerf, 0) / creatorsArray.length).toFixed(0)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Forecasts Generated</span>
            </div>
            <p className="text-2xl font-bold">{Object.keys(forecasts).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Creator Forecast Cards */}
      {creatorsArray.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No creator earnings data yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Submit content metrics to generate forecasts.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {creatorsArray.map(([creatorId, earnings]) => {
            const forecast = forecasts[creatorId];
            return (
              <Card key={creatorId} className="animate-fade-in">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {earnings.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{earnings.name}</p>
                        <p className="text-xs text-muted-foreground">{earnings.handle}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => handleForecast(creatorId, earnings.name)} disabled={forecasting}>
                      {forecasting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      Forecast
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Total Earned</p>
                      <p className="text-sm font-bold text-emerald-500">${earnings.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Campaigns</p>
                      <p className="text-sm font-bold">{earnings.campaigns}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Avg Score</p>
                      <p className="text-sm font-bold">{earnings.avgPerf.toFixed(0)}</p>
                    </div>
                  </div>

                  {forecast && (
                    <div className="border-t border-border pt-3 space-y-2 animate-fade-in">
                      <p className="text-xs font-semibold text-primary flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI Forecast
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-accent/50 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Next Month</p>
                          <p className="text-sm font-bold">${forecast.next_month_earnings?.toLocaleString() ?? "—"}</p>
                        </div>
                        <div className="bg-accent/50 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Growth</p>
                          <p className="text-sm font-bold text-emerald-500">+{forecast.growth_prediction ?? 0}%</p>
                        </div>
                      </div>
                      {forecast.top_platform && (
                        <p className="text-xs text-muted-foreground">📱 Top platform: <strong>{forecast.top_platform}</strong></p>
                      )}
                      {forecast.recommendation && (
                        <p className="text-xs text-muted-foreground">💡 {forecast.recommendation}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CreatorForecasting;
