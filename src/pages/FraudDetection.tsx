import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { Shield, AlertTriangle, Ban, CheckCircle, Eye, X, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useCreators } from "@/hooks/useData";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csvExport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const FraudDetection = () => {
  const { data: creators = [] } = useCreators();
  const queryClient = useQueryClient();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any>(null);

  const flagged = creators.filter((c) => (c.fraud_risk_score ?? 0) >= 15);
  const clean = creators.filter((c) => (c.fraud_risk_score ?? 0) < 15);
  const highRisk = creators.filter((c) => (c.fraud_risk_score ?? 0) >= 50);

  const dismissCreator = useMutation({
    mutationFn: async (creatorId: string) => {
      const { error } = await supabase
        .from("creators")
        .update({ fraud_risk_score: 0 })
        .eq("id", creatorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creators"] });
      toast.success("Creator cleared from fraud list");
      setDetailsOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleExport = () => {
    const exportData = flagged.map((c) => ({
      name: c.name,
      handle: c.handle,
      platforms: c.platforms?.join(", "),
      follower_count: c.follower_count,
      avg_engagement_rate: c.avg_engagement_rate,
      fraud_risk_score: c.fraud_risk_score,
      category: c.category,
    }));
    exportToCSV(exportData, `fraud-detection-${new Date().toISOString().split("T")[0]}`);
  };

  const getRiskIndicators = (score: number) => {
    const indicators = [];
    if (score >= 20) indicators.push("Unusual engagement patterns");
    if (score >= 35) indicators.push("Suspicious follower growth");
    if (score >= 50) indicators.push("Bot-like activity detected");
    if (score >= 65) indicators.push("High fake engagement ratio");
    if (score >= 80) indicators.push("Critical fraud risk");
    return indicators;
  };

  return (
    <DashboardLayout 
      title="Fraud Detection" 
      subtitle="AI-powered engagement authenticity monitoring"
      action={
        <Button variant="outline" size="sm" onClick={handleExport} disabled={flagged.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Creators" value={creators.length.toString()} change="In system" changeType="neutral" icon={Shield} />
        <StatCard title="Flagged" value={flagged.length.toString()} change={`${((flagged.length / Math.max(creators.length, 1)) * 100).toFixed(1)}% flag rate`} changeType="negative" icon={AlertTriangle} />
        <StatCard title="High Risk" value={highRisk.length.toString()} change="Score ≥ 50" changeType="negative" icon={Ban} />
        <StatCard title="Verified Clean" value={clean.length.toString()} change="Score < 15" changeType="positive" icon={CheckCircle} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Flagged Accounts (Score ≥ 15)</h2>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            {flagged.length} flagged
          </Badge>
        </div>
        
        {flagged.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
              <p className="text-sm font-semibold text-card-foreground mb-1">No flagged creators</p>
              <p className="text-xs text-muted-foreground">All creators are below the fraud risk threshold</p>
            </CardContent>
          </Card>
        )}
        
        {flagged.map((c, i) => {
          const riskLevel = c.fraud_risk_score >= 50 ? "high" : c.fraud_risk_score >= 30 ? "medium" : "low";
          const riskColor = riskLevel === "high" ? "text-destructive" : riskLevel === "medium" ? "text-warning" : "text-accent";
          const indicators = getRiskIndicators(c.fraud_risk_score ?? 0);
          
          return (
            <Card key={c.id} className="border-warning/20 animate-fade-in hover:border-warning/40 transition-colors" style={{ animationDelay: `${i * 80}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-card-foreground">{c.name}</p>
                      <span className="text-xs text-muted-foreground">{c.handle}</span>
                    </div>
                    <div className="flex gap-2 mb-2">
                      {c.platforms?.map((p) => (
                        <Badge key={p} variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-1">
                      {indicators.map((indicator, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                          <span>{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Fraud Risk Score</p>
                    <p className={`text-2xl font-bold ${riskColor}`}>{c.fraud_risk_score}/100</p>
                    <Badge variant="outline" className={`mt-2 ${riskLevel === "high" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"}`}>
                      {riskLevel} risk
                    </Badge>
                  </div>
                </div>
                
                <Progress value={c.fraud_risk_score ?? 0} className="h-2 mb-3" />
                
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    {c.category} · {c.follower_count?.toLocaleString()} followers · {c.avg_engagement_rate}% engagement
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCreator(c);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissCreator.mutate(c.id)}
                      disabled={dismissCreator.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fraud Analysis: {selectedCreator?.name}</DialogTitle>
            <DialogDescription>
              Detailed risk assessment and indicators for this creator
            </DialogDescription>
          </DialogHeader>
          {selectedCreator && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                  <p className="text-2xl font-bold text-destructive">{selectedCreator.fraud_risk_score}/100</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    {selectedCreator.fraud_risk_score >= 50 ? "High" : selectedCreator.fraud_risk_score >= 30 ? "Medium" : "Low"} Risk
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Risk Indicators</p>
                <div className="space-y-2">
                  {getRiskIndicators(selectedCreator.fraud_risk_score ?? 0).map((indicator, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Profile Stats</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Followers: </span>
                    <span className="font-medium text-card-foreground">{selectedCreator.follower_count?.toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Engagement: </span>
                    <span className="font-medium text-card-foreground">{selectedCreator.avg_engagement_rate}%</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Category: </span>
                    <span className="font-medium text-card-foreground">{selectedCreator.category}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Platforms: </span>
                    <span className="font-medium text-card-foreground">{selectedCreator.platforms?.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedCreator && dismissCreator.mutate(selectedCreator.id)}
              disabled={dismissCreator.isPending}
            >
              Clear & Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default FraudDetection;
