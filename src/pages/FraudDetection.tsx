import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import { Shield, AlertTriangle, Ban, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const flaggedCreators = [
  { name: "User_x892", handle: "@suspectx", reason: "Unusual engagement spike", score: 87, detail: "312% engagement increase in 2 hours with bot-like comment patterns" },
  { name: "QuickGrow", handle: "@quickgrow", reason: "Suspicious follower growth", score: 72, detail: "Gained 50K followers in 24h, 80% from same geographic cluster" },
  { name: "ViralKing", handle: "@viralking", reason: "Geographic anomaly", score: 65, detail: "Content targets US audience but 90% engagement from non-target regions" },
];

const FraudDetection = () => {
  return (
    <DashboardLayout title="Fraud Detection" subtitle="AI-powered engagement authenticity monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Scanned Posts" value="12,842" change="Last 24 hours" changeType="neutral" icon={Shield} />
        <StatCard title="Flagged" value="23" change="0.18% flag rate" changeType="negative" icon={AlertTriangle} />
        <StatCard title="Blocked" value="5" change="Auto-blocked" changeType="negative" icon={Ban} />
        <StatCard title="Verified Clean" value="12,814" change="99.8% clean rate" changeType="positive" icon={CheckCircle} />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Flagged Accounts</h2>
        {flaggedCreators.map((c, i) => (
          <Card key={i} className="border-warning/20 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-card-foreground">{c.name}</p>
                    <span className="text-xs text-muted-foreground">{c.handle}</span>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    {c.reason}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Fraud Risk Score</p>
                  <p className="text-lg font-bold text-destructive">{c.score}/100</p>
                </div>
              </div>
              <div className="mb-3">
                <Progress value={c.score} className="h-1.5" />
              </div>
              <p className="text-xs text-muted-foreground">{c.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default FraudDetection;
