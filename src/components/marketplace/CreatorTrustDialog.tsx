import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Shield, Clock, CheckCircle, TrendingUp, type LucideIcon } from "lucide-react";
import { useCreatorTrustDetails, useCreatorRatings } from "@/hooks/useMarketplaceData";
import type { Database } from "@/integrations/supabase/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
}

type Creator = Database["public"]["Tables"]["creators"]["Row"];
type CreatorRating = Database["public"]["Tables"]["brand_creator_ratings"]["Row"] & {
  brands?: { company_name: string | null } | null;
  campaigns?: { name: string | null } | null;
};

const ScoreBar = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: LucideIcon; color: string }) => (
  <div className="flex items-center gap-3">
    <Icon className={`h-4 w-4 ${color} shrink-0`} />
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold">{value.toFixed(0)}</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  </div>
);

const CreatorTrustDialog = ({ open, onOpenChange, creatorId }: Props) => {
  const { data: creator } = useCreatorTrustDetails(creatorId);
  const { data: ratings = [] } = useCreatorRatings(creatorId);

  if (!creator) return null;

  const creatorData = creator as Creator;
  const creatorRatings = ratings as CreatorRating[];
  const trustScore = creatorData.trust_score ?? 50;
  const avgRating = creatorRatings.length > 0
    ? creatorRatings.reduce((sum, rating) => sum + rating.overall_rating, 0) / creatorRatings.length
    : 0;

  // Trust score breakdown
  const histPerf = Math.min((creatorData.avg_engagement_rate || 0) * 10, 100);
  const brandRat = avgRating > 0 ? (avgRating / 5) * 100 : 50;
  const fraudHist = 100 - (creatorData.fraud_risk_score || 0);
  const delivRel = creatorData.delivery_reliability ?? 0;
  const audAuth = creatorData.audience_authenticity ?? 50;
  const contractComp = creatorData.contract_completion_rate ?? 0;

  const calcTrust = 0.30 * histPerf + 0.20 * brandRat + 0.15 * fraudHist + 0.15 * delivRel + 0.10 * audAuth + 0.10 * contractComp;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {creatorData.name?.split(" ").map((namePart) => namePart[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p>{creatorData.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{creatorData.handle}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Trust Score Overview */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{trustScore}</p>
              <p className="text-xs text-muted-foreground">Trust Score</p>
              <Badge variant={trustScore >= 70 ? "default" : trustScore >= 40 ? "secondary" : "destructive"} className="mt-1 text-[10px]">
                {trustScore >= 80 ? "Excellent" : trustScore >= 60 ? "Good" : trustScore >= 40 ? "Fair" : "Low"}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-3xl font-bold text-amber-500">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-xs text-muted-foreground">Avg Brand Rating</p>
              <p className="text-[10px] text-muted-foreground mt-1">{creatorRatings.length} review{creatorRatings.length !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
        </div>

        {/* Score Breakdown */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold mb-2">Trust Score Breakdown</h3>
            <ScoreBar label="Historical Performance (30%)" value={histPerf} icon={TrendingUp} color="text-primary" />
            <ScoreBar label="Brand Ratings (20%)" value={brandRat} icon={Star} color="text-amber-500" />
            <ScoreBar label="Fraud History (15%)" value={fraudHist} icon={Shield} color="text-emerald-500" />
            <ScoreBar label="Delivery Reliability (15%)" value={delivRel} icon={Clock} color="text-blue-500" />
            <ScoreBar label="Audience Authenticity (10%)" value={audAuth} icon={CheckCircle} color="text-violet-500" />
            <ScoreBar label="Contract Completion (10%)" value={contractComp} icon={CheckCircle} color="text-teal-500" />
            <div className="pt-2 border-t border-border flex justify-between">
              <span className="text-xs font-medium">Calculated Trust Score</span>
              <span className="text-sm font-bold text-primary">{calcTrust.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{creatorData.total_campaigns_completed ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Campaigns Done</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{creatorData.disputes ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Disputes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{creatorData.fraud_risk_score ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Fraud Risk</p>
            </CardContent>
          </Card>
        </div>

        {/* Brand Reviews */}
        {creatorRatings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Brand Reviews</h3>
            <div className="space-y-2">
              {creatorRatings.slice(0, 5).map((rating) => (
                <Card key={rating.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{rating.brands?.company_name ?? "Brand"}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < rating.overall_rating ? "text-amber-500 fill-amber-500" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    {rating.campaigns?.name && <p className="text-[10px] text-muted-foreground mb-1">Campaign: {rating.campaigns.name}</p>}
                    {rating.review_text && <p className="text-xs text-muted-foreground">{rating.review_text}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatorTrustDialog;
