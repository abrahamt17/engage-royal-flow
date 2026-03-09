import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Download, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCreators } from "@/hooks/useData";
import { exportToCSV } from "@/lib/csvExport";
import CreatorPaymentProfileDialog from "@/components/payroll/CreatorPaymentProfileDialog";

const riskStyles: Record<string, string> = {
  low: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
};

const getRiskLevel = (score: number | null) => {
  if (!score || score < 20) return "low";
  if (score < 50) return "medium";
  return "high";
};

const Creators = () => {
  const { data: creators = [], isLoading } = useCreators();
  const [search, setSearch] = useState("");
  const [paymentProfileCreator, setPaymentProfileCreator] = useState<{ id: string; name: string } | null>(null);

  const filtered = creators.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase()) ||
      (c.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filtered.map((c) => ({
      name: c.name, handle: c.handle, platforms: c.platforms?.join(", "),
      category: c.category, follower_count: c.follower_count,
      avg_engagement_rate: c.avg_engagement_rate, fraud_risk_score: c.fraud_risk_score,
    }));
    exportToCSV(exportData, `creators-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <DashboardLayout
      title="Creators"
      subtitle="Discover and manage creator partnerships"
      action={
        <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      }
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search creators..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline">Filters</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading creators...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const risk = getRiskLevel(c.fraud_risk_score);
            return (
              <Card
                key={c.id}
                className="hover:border-accent/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-foreground">
                      {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-card-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.handle} · {c.platforms?.join(", ")}
                      </p>
                    </div>
                    <Badge variant="outline" className={riskStyles[risk]}>
                      {risk} risk
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Followers</p>
                      <p className="text-sm font-semibold text-card-foreground">
                        {c.follower_count
                          ? c.follower_count >= 1000000
                            ? `${(c.follower_count / 1000000).toFixed(1)}M`
                            : `${(c.follower_count / 1000).toFixed(0)}K`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="text-sm font-semibold text-card-foreground">
                        {c.avg_engagement_rate ?? 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fraud Score</p>
                      <p className="text-sm font-semibold text-accent">
                        {c.fraud_risk_score ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    {c.category && (
                      <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-xs"
                      onClick={() => setPaymentProfileCreator({ id: c.id, name: c.name })}
                    >
                      <CreditCard className="h-3 w-3 mr-1" /> Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {paymentProfileCreator && (
        <CreatorPaymentProfileDialog
          open={!!paymentProfileCreator}
          onOpenChange={(open) => !open && setPaymentProfileCreator(null)}
          creatorId={paymentProfileCreator.id}
          creatorName={paymentProfileCreator.name}
        />
      )}
    </DashboardLayout>
  );
};

export default Creators;