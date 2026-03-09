import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { usePayoutBatches } from "@/hooks/usePaymentData";
import { format } from "date-fns";

const batchStatusColors: Record<string, string> = {
  draft: "bg-muted/50 text-muted-foreground border-border",
  scheduled: "bg-accent/10 text-accent border-accent/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted/50 text-muted-foreground border-border",
};

const BatchHistory = () => {
  const { data: batches = [], isLoading } = usePayoutBatches();

  if (isLoading) return null;
  if (batches.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Batch History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {batches.map((b: any) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <p className="text-sm font-medium font-mono text-card-foreground">{b.batch_number}</p>
                <p className="text-xs text-muted-foreground">
                  {b.creator_count} creator{b.creator_count !== 1 ? "s" : ""} · {b.payment_method}
                  {b.processed_at && ` · ${format(new Date(b.processed_at), "MMM d, yyyy")}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-card-foreground">${b.total_amount.toLocaleString()}</span>
                <Badge variant="outline" className={batchStatusColors[b.status] ?? ""}>
                  {b.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchHistory;