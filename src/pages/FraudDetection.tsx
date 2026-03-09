import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ScanSearch, Loader2 } from "lucide-react";
import { useCreators } from "@/hooks/useData";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csvExport";
import FraudStatCards from "@/components/fraud/FraudStatCards";
import FraudCreatorCard from "@/components/fraud/FraudCreatorCard";
import FraudDetailsDialog from "@/components/fraud/FraudDetailsDialog";

const FraudDetection = () => {
  const { data: creators = [] } = useCreators();
  const queryClient = useQueryClient();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any>(null);

  const flagged = creators.filter((c) => (c.fraud_risk_score ?? 0) >= 15);
  const clean = creators.filter((c) => (c.fraud_risk_score ?? 0) < 15);
  const highRisk = creators.filter((c) => (c.fraud_risk_score ?? 0) >= 50);

  const runScan = useMutation({
    mutationFn: async (creatorId?: string) => {
      const { data, error } = await supabase.functions.invoke("analyze-fraud", {
        body: creatorId ? { creator_id: creatorId } : { scan_all: true },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["creators"] });
      const count = data?.results?.length ?? 0;
      toast.success(`Fraud scan complete — ${count} creator(s) analyzed`);
    },
    onError: (e: any) => toast.error(e.message || "Scan failed"),
  });

  const dismissCreator = useMutation({
    mutationFn: async (creatorId: string) => {
      // Edge function uses service role key so it can update the creators table
      const { error } = await supabase.functions.invoke("analyze-fraud", {
        body: { creator_id: creatorId, dismiss: true },
      });
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
      indicators: (c.fraud_indicators as any[])?.map((i: any) => i.description).join("; ") ?? "",
    }));
    exportToCSV(exportData, `fraud-detection-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <DashboardLayout
      title="Fraud Detection"
      subtitle="ML-powered engagement authenticity & anomaly detection"
      action={
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => runScan.mutate(undefined)}
            disabled={runScan.isPending || creators.length === 0}
          >
            {runScan.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ScanSearch className="h-4 w-4 mr-2" />
            )}
            {runScan.isPending ? "Scanning..." : "Run Full Scan"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={flagged.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      <FraudStatCards
        total={creators.length}
        flagged={flagged.length}
        highRisk={highRisk.length}
        clean={clean.length}
      />

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
              <p className="text-xs text-muted-foreground">
                All creators are below the fraud risk threshold. Run a scan to analyze patterns.
              </p>
            </CardContent>
          </Card>
        )}

        {flagged.map((c, i) => (
          <FraudCreatorCard
            key={c.id}
            creator={c}
            index={i}
            onViewDetails={(creator) => {
              setSelectedCreator(creator);
              setDetailsOpen(true);
            }}
            onDismiss={(id) => dismissCreator.mutate(id)}
            isDismissing={dismissCreator.isPending}
          />
        ))}
      </div>

      <FraudDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        creator={selectedCreator}
        onDismiss={(id) => dismissCreator.mutate(id)}
        isDismissing={dismissCreator.isPending}
      />
    </DashboardLayout>
  );
};

export default FraudDetection;
