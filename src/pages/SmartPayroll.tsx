import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Zap, Award, ArrowUp } from "lucide-react";
import { usePayroll } from "@/hooks/useData";

const SmartPayroll = () => {
  const { data: payroll = [], isLoading } = usePayroll();

  // Calculate dynamic bonuses for each payroll entry
  const enrichedPayroll = payroll.map((p: any) => {
    const cc = p.campaign_creators;
    const perf = p.perf_score || 0;
    const match = p.match_score || 0;
    const base = p.base_pay || 0;

    // Dynamic multiplier based on performance tiers
    let dynamicMultiplier = p.multiplier || 1;
    let tier = "Standard";
    if (perf >= 90) { dynamicMultiplier = Math.max(dynamicMultiplier, 3.5); tier = "🔥 Elite"; }
    else if (perf >= 75) { dynamicMultiplier = Math.max(dynamicMultiplier, 2.5); tier = "⭐ Premium"; }
    else if (perf >= 50) { dynamicMultiplier = Math.max(dynamicMultiplier, 1.8); tier = "✅ Good"; }

    // Audience match bonus
    const audienceBonus = match >= 90 ? base * 0.25 : match >= 70 ? base * 0.10 : 0;

    // Viral bonus (exponential)
    const viralBonus = perf >= 95 ? base * 0.5 : perf >= 85 ? base * 0.2 : 0;

    // Smart total
    const smartTotal = base * ((perf / 100) * (match / 100) * dynamicMultiplier) + p.bonus + audienceBonus + viralBonus;

    return {
      ...p,
      tier,
      dynamicMultiplier,
      audienceBonus,
      viralBonus,
      smartTotal,
      creator: cc?.creators?.name ?? "Unknown",
      handle: cc?.creators?.handle ?? "",
      campaign: cc?.campaigns?.name ?? "Campaign",
    };
  });

  const totalSmart = enrichedPayroll.reduce((s, p) => s + p.smartTotal, 0);
  const totalOriginal = enrichedPayroll.reduce((s, p) => s + p.total_payment, 0);
  const avgMultiplier = enrichedPayroll.length > 0
    ? enrichedPayroll.reduce((s, p) => s + p.dynamicMultiplier, 0) / enrichedPayroll.length
    : 1;
  const eliteCount = enrichedPayroll.filter((p) => p.tier.includes("Elite")).length;

  return (
    <DashboardLayout title="Smart Dynamic Payroll" subtitle="Adaptive payroll with performance-based dynamic multipliers">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Smart Total</span>
            </div>
            <p className="text-2xl font-bold">${totalSmart.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            {totalOriginal > 0 && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-1">
                <ArrowUp className="h-3 w-3 text-emerald-500" />
                {((totalSmart / totalOriginal - 1) * 100).toFixed(0)}% vs static
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Avg Multiplier</span>
            </div>
            <p className="text-2xl font-bold">{avgMultiplier.toFixed(1)}x</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Viral Bonuses</span>
            </div>
            <p className="text-2xl font-bold">${enrichedPayroll.reduce((s, p) => s + p.viralBonus, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Elite Payouts</span>
            </div>
            <p className="text-2xl font-bold">{eliteCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dynamic Payroll Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : enrichedPayroll.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No payroll entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Base</TableHead>
                    <TableHead className="text-right">Perf</TableHead>
                    <TableHead className="text-right">Match</TableHead>
                    <TableHead className="text-right">Multiplier</TableHead>
                    <TableHead className="text-right">Viral Bonus</TableHead>
                    <TableHead className="text-right">Audience Bonus</TableHead>
                    <TableHead className="text-right font-bold">Smart Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedPayroll.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{p.creator}</p>
                          <p className="text-[10px] text-muted-foreground">{p.handle}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{p.campaign}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{p.tier}</Badge></TableCell>
                      <TableCell className="text-right text-xs">${p.base_pay.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-xs">{p.perf_score.toFixed(0)}</span>
                          <Progress value={p.perf_score} className="h-1 w-12" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs">{p.match_score.toFixed(0)}%</TableCell>
                      <TableCell className="text-right text-xs font-medium">{p.dynamicMultiplier.toFixed(1)}x</TableCell>
                      <TableCell className="text-right text-xs text-amber-500">${p.viralBonus.toFixed(0)}</TableCell>
                      <TableCell className="text-right text-xs text-blue-500">${p.audienceBonus.toFixed(0)}</TableCell>
                      <TableCell className="text-right text-sm font-bold text-emerald-500">${p.smartTotal.toFixed(0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formula Explanation */}
      <Card className="mt-4">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3">Smart Payroll Formula</h3>
          <div className="bg-accent/50 rounded-lg p-4 font-mono text-xs space-y-1">
            <p>payment = base × (perf/100 × match/100 × dynamic_multiplier)</p>
            <p className="text-muted-foreground pl-4">+ standard_bonus</p>
            <p className="text-muted-foreground pl-4">+ audience_match_bonus (10-25% if match &gt; 70%)</p>
            <p className="text-muted-foreground pl-4">+ viral_bonus (20-50% if perf &gt; 85%)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="text-center">
              <Badge variant="outline" className="text-[10px]">🔥 Elite (90+)</Badge>
              <p className="text-xs text-muted-foreground mt-1">3.5x multiplier + 50% viral</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-[10px]">⭐ Premium (75+)</Badge>
              <p className="text-xs text-muted-foreground mt-1">2.5x multiplier + 20% viral</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-[10px]">✅ Good (50+)</Badge>
              <p className="text-xs text-muted-foreground mt-1">1.8x multiplier</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-[10px]">📊 Standard</Badge>
              <p className="text-xs text-muted-foreground mt-1">Base multiplier</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SmartPayroll;
