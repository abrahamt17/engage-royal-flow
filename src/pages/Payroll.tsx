import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import StatCard from "@/components/dashboard/StatCard";
import { DollarSign, Clock, CheckCircle, AlertTriangle, Download, Send, FileText } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { usePayroll } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csvExport";
import BatchPayoutDialog from "@/components/payroll/BatchPayoutDialog";
import EscrowPanel from "@/components/payroll/EscrowPanel";
import BatchHistory from "@/components/payroll/BatchHistory";
import TaxDocumentDialog from "@/components/payroll/TaxDocumentDialog";
import type { Database } from "@/integrations/supabase/types";

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-accent/10 text-accent border-accent/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  flagged: "bg-destructive/10 text-destructive border-destructive/20",
};

type PayrollRow = Database["public"]["Tables"]["payroll"]["Row"];
type PayrollStatus = Database["public"]["Enums"]["payout_status"];
type PayrollRecord = PayrollRow & {
  campaign_creators?: {
    creators?: { name: string | null } | null;
    campaigns?: { name: string | null } | null;
  } | null;
};

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "Something went wrong";

const Payroll = () => {
  const { data: payroll = [], isLoading } = usePayroll();
  const { brandId } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [taxDialogOpen, setTaxDialogOpen] = useState(false);
  const payrollRecords = payroll as PayrollRecord[];

  const pendingPayroll = payrollRecords.filter((p) => p.status === "pending");

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === pendingPayroll.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingPayroll.map((p) => p.id)));
    }
  };

  const selectedTotal = payrollRecords
    .filter((p) => selected.has(p.id))
    .reduce((s, p) => s + (p.total_payment ?? 0), 0);

  const createBatch = useMutation({
    mutationFn: async (opts: { paymentMethod: string; scheduledFor?: string }) => {
      const { data, error } = await supabase.functions.invoke("process-payouts", {
        body: {
          action: "create_batch",
          payrollIds: Array.from(selected),
          brandId,
          paymentMethod: opts.paymentMethod,
          scheduledFor: opts.scheduledFor,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // If no scheduled date, process immediately
      if (!opts.scheduledFor && data?.batch?.id) {
        const { data: result, error: procErr } = await supabase.functions.invoke("process-payouts", {
          body: { action: "process_batch", batchId: data.batch.id },
        });
        if (procErr) throw procErr;
        if (result?.error) throw new Error(result.error);
        return result;
      }
      return data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      queryClient.invalidateQueries({ queryKey: ["payout_batches"] });
      setSelected(new Set());
      setBatchDialogOpen(false);
      if (result?.successCount !== undefined) {
        const modeLabel = result?.executionMode === "manual" ? "manual handoff prepared" : "automated payout submitted";
        toast.success(`Batch processed: ${result.successCount} succeeded, ${result.failureCount} failed (${modeLabel})`);
      } else {
        const modeLabel = result?.executionMode === "manual" ? "manual handoff queued" : "automated payout queued";
        toast.success(`Batch scheduled successfully (${modeLabel})`);
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updatePayrollStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PayrollStatus }) => {
      const updates: Database["public"]["Tables"]["payroll"]["Update"] = { status };
      if (status === "paid") updates.paid_at = new Date().toISOString();
      const { error } = await supabase.from("payroll").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast.success("Payroll status updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const totalPaid = payrollRecords.filter((p) => p.status === "paid").reduce((s, p) => s + (p.total_payment ?? 0), 0);
  const pending = payrollRecords.filter((p) => p.status === "pending");
  const completed = payrollRecords.filter((p) => p.status === "paid").length;
  const flagged = payrollRecords.filter((p) => p.status === "flagged").length;

  const handleExport = () => {
    const exportData = payrollRecords.map((p) => ({
      creator: p.campaign_creators?.creators?.name ?? "Unknown",
      campaign: p.campaign_creators?.campaigns?.name ?? "—",
      base_pay: p.base_pay, perf_score: p.perf_score, match_score: p.match_score,
      multiplier: p.multiplier, bonus: p.bonus, total_payment: p.total_payment,
      currency: p.currency, status: p.status, payment_method: p.payment_method ?? "—",
      converted_amount: p.converted_amount ?? "—", converted_currency: p.converted_currency ?? "—",
      paid_at: p.paid_at, created_at: p.created_at,
    }));
    exportToCSV(exportData, `payroll-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <DashboardLayout
      title="Payroll"
      subtitle="Automated creator compensation engine"
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setTaxDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" /> Tax Docs
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={payrollRecords.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Paid" value={`$${totalPaid.toLocaleString()}`} change="All time" changeType="neutral" icon={DollarSign} />
        <StatCard title="Pending" value={`$${pending.reduce((s, p) => s + p.total_payment, 0).toLocaleString()}`} change={`${pending.length} payouts`} changeType="neutral" icon={Clock} />
        <StatCard title="Completed" value={completed.toString()} change="Payouts" changeType="positive" icon={CheckCircle} />
        <StatCard title="Flagged" value={flagged.toString()} change="Under review" changeType="negative" icon={AlertTriangle} />
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="mb-4 p-3 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between">
          <p className="text-sm text-card-foreground">
            <span className="font-semibold">{selected.size}</span> selected · ${selectedTotal.toLocaleString()} total
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>Clear</Button>
            <Button size="sm" onClick={() => setBatchDialogOpen(true)}>
              <Send className="h-4 w-4 mr-2" /> Create Batch Payout
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 mb-6">
        <EscrowPanel />
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
          ) : payrollRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payroll records yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={pendingPayroll.length > 0 && selected.size === pendingPayroll.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Creator</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Campaign</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Base Pay</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Perf</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Match</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Total</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Method</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.map((p) => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell>
                      {p.status === "pending" && (
                        <Checkbox
                          checked={selected.has(p.id)}
                          onCheckedChange={() => toggleSelect(p.id)}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-card-foreground">
                      {p.campaign_creators?.creators?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.campaign_creators?.campaigns?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">${p.base_pay}</TableCell>
                    <TableCell className="font-mono text-sm text-card-foreground">{p.perf_score.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-sm text-card-foreground">{p.match_score.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold text-card-foreground">
                      ${p.total_payment.toLocaleString()}
                      {p.converted_amount && p.converted_currency && p.converted_currency !== p.currency && (
                        <span className="block text-xs text-muted-foreground font-normal">
                          ≈ {p.converted_amount} {p.converted_currency}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground capitalize">{p.payment_method ?? "—"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[p.status] ?? ""}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
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

      <div className="mt-6">
        <BatchHistory />
      </div>

      <BatchPayoutDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        selectedCount={selected.size}
        totalAmount={selectedTotal}
        onCreateBatch={(opts) => createBatch.mutate(opts)}
        isPending={createBatch.isPending}
      />

      <TaxDocumentDialog open={taxDialogOpen} onOpenChange={setTaxDialogOpen} />
    </DashboardLayout>
  );
};

export default Payroll;
