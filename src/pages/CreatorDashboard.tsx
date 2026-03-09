import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import StatCard from "@/components/dashboard/StatCard";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DollarSign, Eye, TrendingUp, Star, Search } from "lucide-react";
import { useCreators, useCampaignCreators, useCreatorContent, usePayroll } from "@/hooks/useData";

const CreatorDashboard = () => {
  const { data: creators = [] } = useCreators();
  const { data: assignments = [] } = useCampaignCreators();
  const { data: allContent = [] } = useCreatorContent();
  const { data: payroll = [] } = usePayroll();
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
  const [search, setSearch] = useState("");

  const filteredCreators = creators.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.handle.toLowerCase().includes(search.toLowerCase())
  );

  const creator = creators.find((c) => c.id === selectedCreatorId);

  // Get data for selected creator
  const creatorAssignments = assignments.filter((a: any) => a.creator_id === selectedCreatorId);
  const creatorContent = allContent.filter((c: any) =>
    creatorAssignments.some((a: any) => a.id === c.campaign_creator_id)
  );
  const creatorPayroll = payroll.filter((p: any) =>
    creatorAssignments.some((a: any) => a.id === p.campaign_creator_id)
  );

  const totalEarned = creatorPayroll.reduce((s, p: any) => s + (p.total_payment ?? 0), 0);
  const pendingEarnings = creatorPayroll.filter((p: any) => p.status === "pending").reduce((s, p: any) => s + (p.total_payment ?? 0), 0);
  const totalViews = creatorContent.reduce((s, c: any) => s + (c.views ?? 0), 0);
  const avgPerfScore = creatorContent.length > 0
    ? creatorContent.reduce((s, c: any) => s + (c.performance_score ?? 0), 0) / creatorContent.length
    : 0;

  return (
    <DashboardLayout title="Creator Dashboard" subtitle="Creator performance and earnings overview">
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search creators..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={selectedCreatorId} onValueChange={setSelectedCreatorId}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select a creator" />
          </SelectTrigger>
          <SelectContent>
            {filteredCreators.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name} (@{c.handle})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedCreatorId ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">Select a creator to view their dashboard</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Creator header */}
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/20">
            <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-foreground">
              {creator?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-card-foreground">{creator?.name}</h2>
              <p className="text-sm text-muted-foreground">@{creator?.handle} · {creator?.platforms?.join(", ")}</p>
            </div>
            <div className="flex gap-2">
              {creator?.category && <Badge variant="secondary">{creator.category}</Badge>}
              <Badge variant="outline" className={
                (creator?.fraud_risk_score ?? 0) < 20 ? "bg-success/10 text-success border-success/20" :
                (creator?.fraud_risk_score ?? 0) < 50 ? "bg-warning/10 text-warning border-warning/20" :
                "bg-destructive/10 text-destructive border-destructive/20"
              }>
                Risk: {creator?.fraud_risk_score ?? 0}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Earned" value={`$${totalEarned.toLocaleString()}`} change="All time" changeType="positive" icon={DollarSign} />
            <StatCard title="Pending" value={`$${pendingEarnings.toLocaleString()}`} change="Awaiting payment" changeType="neutral" icon={DollarSign} />
            <StatCard title="Total Views" value={totalViews >= 1000000 ? `${(totalViews / 1000000).toFixed(1)}M` : `${(totalViews / 1000).toFixed(0)}K`} change={`${creatorContent.length} posts`} changeType="neutral" icon={Eye} />
            <StatCard title="Avg Performance" value={`${avgPerfScore.toFixed(1)}%`} change="Score" changeType={avgPerfScore > 50 ? "positive" : "neutral"} icon={Star} />
          </div>

          {/* Content Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Content Performance</CardTitle>
              <CardDescription className="text-xs">All submitted content and scores</CardDescription>
            </CardHeader>
            <CardContent>
              {creatorContent.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No content submitted yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Platform</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Views</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Engagement</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Watch Time</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Perf Score</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Match Score</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creatorContent.map((c: any) => (
                      <TableRow key={c.id} className="border-border">
                        <TableCell><Badge variant="outline">{c.platform}</Badge></TableCell>
                        <TableCell className="text-card-foreground">{(c.views ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-card-foreground">{((c.likes ?? 0) + (c.comments ?? 0) + (c.shares ?? 0)).toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-sm text-card-foreground">{(c.watch_time_pct ?? 0).toFixed(1)}%</TableCell>
                        <TableCell className="font-mono text-sm text-card-foreground">{(c.performance_score ?? 0).toFixed(1)}</TableCell>
                        <TableCell className="font-mono text-sm text-card-foreground">{(c.audience_match_score ?? 0).toFixed(1)}%</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Payout History</CardTitle>
              <CardDescription className="text-xs">All payroll records and estimates</CardDescription>
            </CardHeader>
            <CardContent>
              {creatorPayroll.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No payroll records yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Campaign</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Base</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Bonus</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Total</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creatorPayroll.map((p: any) => (
                      <TableRow key={p.id} className="border-border">
                        <TableCell className="text-card-foreground">{p.campaign_creators?.campaigns?.name ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">${p.base_pay}</TableCell>
                        <TableCell className="text-muted-foreground">${p.bonus}</TableCell>
                        <TableCell className="font-semibold text-card-foreground">${p.total_payment.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            p.status === "paid" ? "bg-success/10 text-success border-success/20" :
                            p.status === "pending" ? "bg-warning/10 text-warning border-warning/20" :
                            p.status === "processing" ? "bg-accent/10 text-accent border-accent/20" :
                            "bg-destructive/10 text-destructive border-destructive/20"
                          }>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CreatorDashboard;