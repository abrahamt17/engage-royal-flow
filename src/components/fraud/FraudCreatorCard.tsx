import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Eye, X, Brain, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FraudIndicator {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  score: number;
}

interface FraudCreatorCardProps {
  creator: any;
  index: number;
  onViewDetails: (creator: any) => void;
  onDismiss: (id: string) => void;
  isDismissing: boolean;
}

const severityColors: Record<string, string> = {
  low: "bg-accent/10 text-accent border-accent/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  critical: "bg-destructive/20 text-destructive border-destructive/30",
};

const FraudCreatorCard = ({ creator, index, onViewDetails, onDismiss, isDismissing }: FraudCreatorCardProps) => {
  const score = creator.fraud_risk_score ?? 0;
  const riskLevel = score >= 50 ? "high" : score >= 30 ? "medium" : "low";
  const riskColor = riskLevel === "high" ? "text-destructive" : riskLevel === "medium" ? "text-warning" : "text-accent";
  const indicators: FraudIndicator[] = creator.fraud_indicators ?? [];
  const hasAiFlags = indicators.some((i: FraudIndicator) => i.type === "ai_detected");

  return (
    <Card
      className="border-warning/20 animate-fade-in hover:border-warning/40 transition-colors"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-card-foreground">{creator.name}</p>
              <span className="text-xs text-muted-foreground">{creator.handle}</span>
              {hasAiFlags && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-[10px]">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Analyzed
                </Badge>
              )}
            </div>
            <div className="flex gap-2 mb-2">
              {creator.platforms?.map((p: string) => (
                <Badge key={p} variant="outline" className="bg-secondary text-secondary-foreground border-border">
                  {p}
                </Badge>
              ))}
            </div>
            <div className="space-y-1">
              {indicators.slice(0, 4).map((indicator: FraudIndicator, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className={`h-3 w-3 mt-0.5 shrink-0 ${indicator.severity === "critical" || indicator.severity === "high" ? "text-destructive" : "text-warning"}`} />
                  <span>{indicator.description}</span>
                  <Badge variant="outline" className={`text-[9px] px-1 py-0 ml-auto shrink-0 ${severityColors[indicator.severity]}`}>
                    {indicator.severity}
                  </Badge>
                </div>
              ))}
              {indicators.length > 4 && (
                <p className="text-xs text-muted-foreground pl-5">+{indicators.length - 4} more indicators</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Fraud Risk Score</p>
            <p className={`text-2xl font-bold ${riskColor}`}>{score}/100</p>
            <Badge
              variant="outline"
              className={`mt-2 ${riskLevel === "high" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"}`}
            >
              {riskLevel} risk
            </Badge>
          </div>
        </div>

        <Progress value={score} className="h-2 mb-3" />

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{creator.category} · {creator.follower_count?.toLocaleString()} followers · {creator.avg_engagement_rate}% eng.</span>
            {creator.last_fraud_scan && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Scanned {formatDistanceToNow(new Date(creator.last_fraud_scan), { addSuffix: true })}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onViewDetails(creator)}>
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDismiss(creator.id)} disabled={isDismissing}>
              <X className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FraudCreatorCard;
