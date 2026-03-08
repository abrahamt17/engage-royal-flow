import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import { DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePayroll } from "@/hooks/useData";

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-accent/10 text-accent border-accent/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  flagged: "bg-destructive/10 text-destructive border-destructive/20",
};

const Payroll = () => {
  const { data: payroll = [], isLoading } = usePayroll();

  const totalPaid = payroll
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + (p.total_payment ?? 0), 0);
  const pending = payroll.filter((p) => p.status === "pending");
  const completed = payroll.filter((p) => p.status === "paid").length;
  const flagged = payroll.filter((p) => p.status === "flagged").length;

  return (
    <DashboardLayout title="Payroll" subtitle="Automated creator compensation engine">
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
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Base Pay</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Perf Score</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Match Score</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Total</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((p) => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell className="font-medium text-card-foreground">
                      {(p.campaign_creators as any)?.creators?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">${p.base_pay}</TableCell>
                    <TableCell className="font-mono text-sm text-card-foreground">{p.perf_score.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-sm text-card-foreground">{p.match_score.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold text-card-foreground">${p.total_payment.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[p.status] ?? ""}>{p.status}</Badge>
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
