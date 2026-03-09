import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Brain, TrendingUp, Users, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface FraudIndicator {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  score: number;
}

interface FraudDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: any;
  onDismiss: (id: string) => void;
  isDismissing: boolean;
}

const severityColors: Record<string, string> = {
  low: "bg-accent/10 text-accent border-accent/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  critical: "bg-destructive/20 text-destructive border-destructive/30",
};

const typeIcons: Record<string, typeof AlertTriangle> = {
  engagement_anomaly: TrendingUp,
  dead_followers: Users,
  view_spike: Activity,
  bot_comments: Brain,
  ai_detected: Brain,
};

const FraudDetailsDialog = ({ open, onOpenChange, creator, onDismiss, isDismissing }: FraudDetailsDialogProps) => {
  if (!creator) return null;

  const indicators: FraudIndicator[] = creator.fraud_indicators ?? [];
  const score = creator.fraud_risk_score ?? 0;
  const riskLevel = score >= 50 ? "High" : score >= 30 ? "Medium" : "Low";
  const heuristicIndicators = indicators.filter((i) => i.type !== "ai_detected");
  const aiIndicators = indicators.filter((i) => i.type === "ai_detected");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fraud Analysis: {creator.name}</DialogTitle>
          <DialogDescription>
            ML-powered risk assessment with engagement pattern analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Score overview */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Composite Fraud Score</p>
              <p className={`text-3xl font-bold ${score >= 50 ? "text-destructive" : score >= 30 ? "text-warning" : "text-accent"}`}>
                {score}<span className="text-sm text-muted-foreground font-normal">/100</span>
              </p>
              <Progress value={score} className="h-2 mt-2" />
            </div>
            <Badge
              variant="outline"
              className={`text-sm px-3 py-1 ${score >= 50 ? "bg-destructive/10 text-destructive border-destructive/20" : score >= 30 ? "bg-warning/10 text-warning border-warning/20" : "bg-accent/10 text-accent border-accent/20"}`}
            >
              {riskLevel} Risk
            </Badge>
          </div>

          {/* Heuristic indicators */}
          {heuristicIndicators.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Pattern Analysis Indicators
              </p>
              <div className="space-y-2">
                {heuristicIndicators.map((indicator, idx) => {
                  const Icon = typeIcons[indicator.type] ?? AlertTriangle;
                  return (
                    <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded-md bg-secondary/50">
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${indicator.severity === "critical" || indicator.severity === "high" ? "text-destructive" : "text-warning"}`} />
                      <span className="text-muted-foreground flex-1">{indicator.description}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-[10px] ${severityColors[indicator.severity]}`}>
                          {indicator.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">+{indicator.score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI indicators */}
          {aiIndicators.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI-Detected Anomalies
              </p>
              <div className="space-y-2">
                {aiIndicators.map((indicator, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded-md bg-accent/5 border border-accent/10">
                    <Brain className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{indicator.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {indicators.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No specific indicators detected. Run a scan for detailed analysis.
            </p>
          )}

          {/* Profile stats */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Profile Stats</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Followers: </span>
                <span className="font-medium text-card-foreground">{creator.follower_count?.toLocaleString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Engagement: </span>
                <span className="font-medium text-card-foreground">{creator.avg_engagement_rate}%</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Category: </span>
                <span className="font-medium text-card-foreground">{creator.category}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Platforms: </span>
                <span className="font-medium text-card-foreground">{creator.platforms?.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDismiss(creator.id)}
            disabled={isDismissing}
          >
            Clear & Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FraudDetailsDialog;
