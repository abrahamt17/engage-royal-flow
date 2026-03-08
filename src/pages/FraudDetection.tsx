import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import { Shield, AlertTriangle, Ban, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useCreators } from "@/hooks/useData";

const FraudDetection = () => {
  const { data: creators = [] } = useCreators();

  const flagged = creators.filter((c) => (c.fraud_risk_score ?? 0) >= 15);
  const clean = creators.filter((c) => (c.fraud_risk_score ?? 0) < 15);

  return (
    <DashboardLayout title="Fraud Detection" subtitle="AI-powered engagement authenticity monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Creators" value={creators.length.toString()} change="In system" changeType="neutral" icon={Shield} />
        <StatCard title="Flagged" value={flagged.length.toString()} change={`${((flagged.length / Math.max(creators.length, 1)) * 100).toFixed(1)}% flag rate`} changeType="negative" icon={AlertTriangle} />
        <StatCard title="High Risk" value={creators.filter((c) => (c.fraud_risk_score ?? 0) >= 50).length.toString()} change="Score ≥ 50" changeType="negative" icon={Ban} />
        <StatCard title="Verified Clean" value={clean.length.toString()} change="Score < 15" changeType="positive" icon={CheckCircle} />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Flagged Accounts (Score ≥ 15)</h2>
        {flagged.length === 0 && (
          <p className="text-sm text-muted-foreground">No flagged creators.</p>
        )}
        {flagged.map((c, i) => (
          <Card key={c.id} className="border-warning/20 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-card-foreground">{c.name}</p>
                    <span className="text-xs text-muted-foreground">{c.handle}</span>
                  </div>
                  <div className="flex gap-2">
                    {c.platforms?.map((p) => (
                      <Badge key={p} variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Fraud Risk Score</p>
                  <p className="text-lg font-bold text-destructive">{c.fraud_risk_score}/100</p>
                </div>
              </div>
              <Progress value={c.fraud_risk_score ?? 0} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-2">
                {c.category} creator · {c.follower_count?.toLocaleString()} followers · {c.avg_engagement_rate}% engagement
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default FraudDetection;
