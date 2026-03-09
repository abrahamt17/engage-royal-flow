import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Shield, Users, Award, Globe, MapPin } from "lucide-react";
import { useCreatorTrustDetails, useCreatorRatings } from "@/hooks/useMarketplaceData";

const CreatorPortfolio = () => {
  const { id } = useParams<{ id: string }>();
  const { data: creator, isLoading } = useCreatorTrustDetails(id);
  const { data: ratings = [] } = useCreatorRatings(id);

  if (isLoading) return <DashboardLayout title="Loading..."><p className="text-sm text-muted-foreground">Loading portfolio...</p></DashboardLayout>;
  if (!creator) return <DashboardLayout title="Not Found"><p className="text-sm text-muted-foreground">Creator not found.</p></DashboardLayout>;

  const avgRating = ratings.length > 0
    ? ratings.reduce((s: number, r: any) => s + r.overall_rating, 0) / ratings.length
    : 0;

  const trustScore = creator.trust_score ?? 50;
  const getTrustLabel = (s: number) => s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Fair" : "Low";
  const getTrustColor = (s: number) => s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : s >= 40 ? "text-orange-500" : "text-destructive";

  return (
    <DashboardLayout title={creator.name} subtitle={`${creator.handle} · Creator Portfolio`}>
      {/* Hero Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {creator.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{creator.name}</h1>
              <p className="text-muted-foreground">{creator.handle}</p>
              {creator.bio && <p className="text-sm text-muted-foreground mt-2">{creator.bio}</p>}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {creator.location && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {creator.location}</span>
                )}
                {creator.languages && (creator.languages as string[]).length > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" /> {(creator.languages as string[]).join(", ")}</span>
                )}
                {creator.category && <Badge variant="secondary" className="text-xs">{creator.category}</Badge>}
                {creator.platforms?.map((p: string) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
              </div>
            </div>
            <div className="text-center shrink-0">
              <div className={`text-4xl font-bold ${getTrustColor(trustScore)}`}>{trustScore}</div>
              <p className="text-xs text-muted-foreground">Trust Score</p>
              <Badge variant={trustScore >= 70 ? "default" : "secondary"} className="mt-1 text-[10px]">{getTrustLabel(trustScore)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center">
          <Users className="h-4 w-4 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{creator.follower_count ? creator.follower_count >= 1000000 ? `${(creator.follower_count / 1000000).toFixed(1)}M` : `${(creator.follower_count / 1000).toFixed(0)}K` : "0"}</p>
          <p className="text-[10px] text-muted-foreground">Followers</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <TrendingUp className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{creator.avg_engagement_rate ?? 0}%</p>
          <p className="text-[10px] text-muted-foreground">Engagement</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Award className="h-4 w-4 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{creator.total_campaigns_completed ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Campaigns</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Shield className="h-4 w-4 text-violet-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{creator.fraud_risk_score ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Fraud Risk</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Star className="h-4 w-4 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
          <p className="text-[10px] text-muted-foreground">Avg Rating</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-lg font-bold">{creator.delivery_reliability ?? 0}%</p>
          <p className="text-[10px] text-muted-foreground">Reliability</p>
        </CardContent></Card>
      </div>

      {/* Trust Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">Trust Score Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Historical Performance", weight: "30%", value: Math.min((creator.avg_engagement_rate || 0) * 10, 100) },
                { label: "Brand Ratings", weight: "20%", value: avgRating > 0 ? (avgRating / 5) * 100 : 50 },
                { label: "Fraud History", weight: "15%", value: 100 - (creator.fraud_risk_score || 0) },
                { label: "Delivery Reliability", weight: "15%", value: creator.delivery_reliability ?? 0 },
                { label: "Audience Authenticity", weight: "10%", value: creator.audience_authenticity ?? 50 },
                { label: "Contract Completion", weight: "10%", value: creator.contract_completion_rate ?? 0 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{item.label} ({item.weight})</span>
                    <span className="text-xs font-semibold">{item.value.toFixed(0)}</span>
                  </div>
                  <Progress value={item.value} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Brand Reviews */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">Brand Reviews ({ratings.length})</h3>
            {ratings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No reviews yet.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {ratings.map((r: any) => (
                  <div key={r.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{r.brands?.company_name ?? "Brand"}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.overall_rating ? "text-amber-500 fill-amber-500" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    {r.campaigns?.name && <p className="text-[10px] text-muted-foreground">Campaign: {r.campaigns.name}</p>}
                    {r.review_text && <p className="text-xs text-muted-foreground mt-1">{r.review_text}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price Range */}
      {(creator.price_range_min > 0 || creator.price_range_max > 0) && (
        <Card className="mt-6">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-2">Pricing</h3>
            <p className="text-2xl font-bold">${creator.price_range_min?.toLocaleString()} – ${creator.price_range_max?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per campaign</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default CreatorPortfolio;
