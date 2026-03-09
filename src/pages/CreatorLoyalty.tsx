import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, TrendingUp, Gift, Crown, Shield, Zap } from "lucide-react";
import { useCreatorLoyalty } from "@/hooks/usePlatformData";

const tiers = [
  { name: "Bronze", min: 0, max: 499, color: "text-amber-700", bg: "bg-amber-700/10", icon: "🥉", benefits: ["Standard base pay", "Basic analytics"] },
  { name: "Silver", min: 500, max: 1999, color: "text-slate-400", bg: "bg-slate-400/10", icon: "🥈", benefits: ["+10% base pay", "Priority support", "Early campaign access"] },
  { name: "Gold", min: 2000, max: 4999, color: "text-amber-500", bg: "bg-amber-500/10", icon: "🥇", benefits: ["+20% base pay", "Featured listing", "Brand priority", "Premium analytics"] },
  { name: "Platinum", min: 5000, max: Infinity, color: "text-violet-500", bg: "bg-violet-500/10", icon: "💎", benefits: ["+30% base pay", "VIP brand access", "Dedicated account manager", "Custom contracts", "Revenue share bonus"] },
];

const getTier = (points: number) => tiers.find((t) => points >= t.min && points <= t.max) || tiers[0];
const getNextTier = (points: number) => {
  const idx = tiers.findIndex((t) => points >= t.min && points <= t.max);
  return idx < tiers.length - 1 ? tiers[idx + 1] : null;
};

const CreatorLoyalty = () => {
  const { data: loyalty = [], isLoading } = useCreatorLoyalty();

  const tierCounts = tiers.map((t) => ({
    ...t,
    count: loyalty.filter((l: any) => {
      const tier = getTier(l.total_points || 0);
      return tier.name === t.name;
    }).length,
  }));

  return (
    <DashboardLayout title="Creator Loyalty Program" subtitle="Gamified tier system rewarding top creators">
      {/* Tier Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {tierCounts.map((t) => (
          <Card key={t.name}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{t.icon}</span>
                <span className={`text-sm font-bold ${t.color}`}>{t.name}</span>
              </div>
              <p className="text-2xl font-bold">{t.count}</p>
              <p className="text-[10px] text-muted-foreground">{t.min.toLocaleString()}–{t.max === Infinity ? "∞" : t.max.toLocaleString()} pts</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier Benefits */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Gift className="h-4 w-4" /> Tier Benefits</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((t) => (
              <div key={t.name} className={`rounded-lg p-4 border ${t.bg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{t.icon}</span>
                  <span className={`font-bold ${t.color}`}>{t.name}</span>
                </div>
                <ul className="space-y-1.5">
                  {t.benefits.map((b, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-primary shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points Earning Guide */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" /> How to Earn Points</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { action: "Complete Campaign", points: 100, icon: "✅" },
              { action: "On-Time Delivery", points: 50, icon: "⏰" },
              { action: "5-Star Review", points: 75, icon: "⭐" },
              { action: "Viral Content (100K+)", points: 200, icon: "🔥" },
              { action: "Perfect Compliance", points: 30, icon: "📋" },
              { action: "Referral", points: 150, icon: "🤝" },
              { action: "Consecutive Campaigns", points: 25, icon: "🔁" },
              { action: "High Audience Match", points: 40, icon: "🎯" },
            ].map((item) => (
              <div key={item.action} className="bg-accent/50 rounded-lg p-3 text-center">
                <span className="text-xl">{item.icon}</span>
                <p className="text-xs font-medium mt-1">{item.action}</p>
                <Badge variant="outline" className="text-[10px] mt-1">+{item.points} pts</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Creator Loyalty List */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Crown className="h-4 w-4" /> Creator Leaderboard</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : loyalty.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No loyalty data yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Creators earn points by completing campaigns and delivering quality content.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {loyalty.map((l: any, i: number) => {
                const tier = getTier(l.total_points || 0);
                const nextTier = getNextTier(l.total_points || 0);
                const progress = nextTier
                  ? ((l.total_points - tier.min) / (nextTier.min - tier.min)) * 100
                  : 100;
                return (
                  <div key={l.id} className="flex items-center gap-4 p-3 rounded-lg border border-border animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <div className="text-lg font-bold text-muted-foreground w-8 text-center">#{i + 1}</div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {l.creators?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{l.creators?.name ?? "Creator"}</p>
                        <Badge variant="outline" className={`text-[10px] ${tier.bg} ${tier.color}`}>
                          {tier.icon} {tier.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{l.creators?.handle}</p>
                    </div>
                    <div className="text-right shrink-0 w-32">
                      <p className="text-sm font-bold">{(l.total_points || 0).toLocaleString()} pts</p>
                      {nextTier && (
                        <div className="mt-1">
                          <Progress value={progress} className="h-1" />
                          <p className="text-[10px] text-muted-foreground mt-0.5">{nextTier.min - l.total_points} to {nextTier.name}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <p className="text-xs text-muted-foreground">{l.campaigns_completed || 0} campaigns</p>
                      <p className="text-xs text-muted-foreground">${(l.lifetime_earnings || 0).toLocaleString()} earned</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CreatorLoyalty;
