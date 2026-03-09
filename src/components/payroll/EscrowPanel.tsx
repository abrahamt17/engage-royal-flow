import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRightLeft } from "lucide-react";
import { useEscrow } from "@/hooks/usePaymentData";

const statusColors: Record<string, string> = {
  funded: "bg-success/10 text-success border-success/20",
  partially_released: "bg-warning/10 text-warning border-warning/20",
  fully_released: "bg-muted/50 text-muted-foreground border-border",
  refunded: "bg-destructive/10 text-destructive border-destructive/20",
};

const EscrowPanel = () => {
  const { data: escrows = [], isLoading } = useEscrow();

  if (isLoading) return null;
  if (escrows.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          Campaign Escrow
        </CardTitle>
        <p className="text-xs text-muted-foreground">Funds held until deliverables are approved</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {escrows.map((e: any) => {
            const released = e.released_amount ?? 0;
            const pct = e.amount > 0 ? Math.round((released / e.amount) * 100) : 0;
            return (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {e.campaigns?.name ?? "Campaign"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      ${released.toLocaleString()} / ${e.amount.toLocaleString()} {e.currency}
                    </span>
                    <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{pct}%</span>
                  </div>
                </div>
                <Badge variant="outline" className={statusColors[e.status] ?? ""}>
                  {e.status.replace("_", " ")}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EscrowPanel;