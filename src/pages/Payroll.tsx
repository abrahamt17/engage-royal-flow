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

const payouts = [
  { creator: "Mia Chen", campaign: "Summer Launch 2026", basePay: "$800", perfScore: 0.94, matchScore: 0.92, total: "$4,280", status: "paid" },
  { creator: "Jake Williams", campaign: "Product Reveal Series", basePay: "$1,200", perfScore: 0.91, matchScore: 0.88, total: "$3,920", status: "paid" },
  { creator: "Priya Patel", campaign: "Summer Launch 2026", basePay: "$600", perfScore: 0.89, matchScore: 0.85, total: "$3,150", status: "pending" },
  { creator: "Carlos Rivera", campaign: "Holiday Campaign", basePay: "$500", perfScore: 0.87, matchScore: 0.90, total: "$2,890", status: "pending" },
  { creator: "Emma Davis", campaign: "Brand Awareness Q1", basePay: "$900", perfScore: 0.85, matchScore: 0.83, total: "$2,640", status: "processing" },
];

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-accent/10 text-accent border-accent/20",
};

const Payroll = () => {
  return (
    <DashboardLayout title="Payroll" subtitle="Automated creator compensation engine">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Paid" value="$147,200" change="This month" changeType="neutral" icon={DollarSign} />
        <StatCard title="Pending" value="$42,800" change="12 creators" changeType="neutral" icon={Clock} />
        <StatCard title="Completed" value="186" change="Payouts this month" changeType="positive" icon={CheckCircle} />
        <StatCard title="Flagged" value="3" change="Under review" changeType="negative" icon={AlertTriangle} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Recent Payouts</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Payment = BasePay × (PerfScore × MatchScore × Multiplier) + Bonuses
          </p>
        </CardHeader>
        <CardContent>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell className="font-medium text-card-foreground">{p.creator}</TableCell>
                  <TableCell className="text-muted-foreground">{p.campaign}</TableCell>
                  <TableCell className="text-muted-foreground">{p.basePay}</TableCell>
                  <TableCell className="font-mono text-sm text-card-foreground">{p.perfScore.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-sm text-card-foreground">{p.matchScore.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold text-card-foreground">{p.total}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[p.status]}>{p.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Payroll;
