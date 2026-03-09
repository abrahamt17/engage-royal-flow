import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { DollarSign, Clock, CheckCircle, AlertTriangle, Check, X, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePayroll } from "@/hooks/useData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csvExport";

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-accent/10 text-accent border-accent/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  flagged: "bg-destructive/10 text-destructive border-destructive/20",
};

const Payroll = () => {
  const { data: payroll = [], isLoading } = usePayroll();
  const queryClient = useQueryClient();

  const updatePayrollStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "paid") {
        updates.paid_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("payroll")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast.success("Payroll status updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalPaid = payroll
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + (p.total_payment ?? 0), 0);
  const pending = payroll.filter((p) => p.status === "pending");
  const completed = payroll.filter((p) => p.status === "paid").length;
  const flagged = payroll.filter((p) => p.status === "flagged").length;

  const handleExport = () => {
    const exportData = payroll.map((p: any) => ({
      creator: p.campaign_creators?.creators?.name ?? "Unknown",
      campaign: p.campaign_creators?.campaigns?.name ?? "—",
      base_pay: p.base_pay,
      perf_score: p.perf_score,
      match_score: p.match_score,
      multiplier: p.multiplier,
      bonus: p.bonus,
      total_payment: p.total_payment,
      currency: p.currency,
      status: p.status,
      paid_at: p.paid_at,
      created_at: p.created_at,
    }));
    exportToCSV(exportData, `payroll-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <DashboardLayout 
      title="Payroll" 
      subtitle="Automated creator compensation engine"
      action={
        <Button variant="outline" size="sm" onClick={handleExport} disabled={payroll.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Paid" value={`$${totalPaid.toLocaleString()}`} change="All time" changeType="neutral" icon={DollarSign} />
        <StatCard title="Pending" value={`$${pending.reduce((s, p) => s + p.total_payment, 0).toLocaleString()}`} change={`${pending.length} payouts`} changeType="neutral" icon={Clock} />
        <StatCard title="Completed" value={completed.toString()} change="Payouts" changeType="positive" icon={CheckCircle} />
        <StatCard title="Flagged" value={flagged.toString()} change="Under review" changeType="negative" icon={AlertTriangle} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Payroll Records</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Payment = BasePay × (PerfScore × MatchScore × Multiplier) + Bonus
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : payroll.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payroll records yet. They will appear once campaigns generate content.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Creator</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Campaign</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Base Pay</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Perf Score</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Match Score</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Total</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((p) => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell className="font-medium text-card-foreground">
                      {(p.campaign_creators as any)?.creators?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(p.campaign_creators as any)?.campaigns?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">${p.base_pay}</TableCell>
                    <TableCell className="font-mono text-sm text-card-foreground">{p.perf_score.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-sm text-card-foreground">{p.match_score.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold text-card-foreground">${p.total_payment.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[p.status] ?? ""}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {p.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updatePayrollStatus.mutate({ id: p.id, status: "processing" })}
                              disabled={updatePayrollStatus.isPending}
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updatePayrollStatus.mutate({ id: p.id, status: "flagged" })}
                              disabled={updatePayrollStatus.isPending}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {p.status === "processing" && (
                          <Button
                            size="sm"
                            onClick={() => updatePayrollStatus.mutate({ id: p.id, status: "paid" })}
                            disabled={updatePayrollStatus.isPending}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Payroll;
