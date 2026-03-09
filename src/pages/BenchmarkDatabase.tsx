import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Plus, Database, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { useIndustryBenchmarks, useCreateBenchmark } from "@/hooks/usePlatformData";
import { toast } from "sonner";

const categories = ["Tech", "Beauty", "Fitness", "Gaming", "Food", "Travel", "Fashion", "Education", "Finance", "Lifestyle", "Entertainment", "Health"];
const platforms = ["TikTok", "Instagram", "YouTube", "Twitter", "Twitch"];
const metricNames = ["avg_engagement_rate", "avg_cpm", "avg_views", "avg_cpa", "avg_follower_growth", "avg_watch_time", "content_frequency"];

const metricLabels: Record<string, string> = {
  avg_engagement_rate: "Avg Engagement Rate (%)",
  avg_cpm: "Avg CPM ($)",
  avg_views: "Avg Views",
  avg_cpa: "Avg CPA ($)",
  avg_follower_growth: "Avg Follower Growth (%)",
  avg_watch_time: "Avg Watch Time (%)",
  content_frequency: "Content Frequency (posts/week)",
};

const BenchmarkDatabase = () => {
  const { data: benchmarks = [], isLoading } = useIndustryBenchmarks();
  const createBenchmark = useCreateBenchmark();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newMetric, setNewMetric] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newSampleSize, setNewSampleSize] = useState("");

  const filteredBenchmarks = useMemo(() => {
    let filtered = benchmarks;
    if (filterCategory) filtered = filtered.filter((b: any) => b.category === filterCategory);
    if (filterPlatform) filtered = filtered.filter((b: any) => b.platform === filterPlatform);
    return filtered;
  }, [benchmarks, filterCategory, filterPlatform]);

  // Group by category for summary
  const categorySummary = useMemo(() => {
    const map: Record<string, { metrics: number; platforms: Set<string> }> = {};
    benchmarks.forEach((b: any) => {
      if (!map[b.category]) map[b.category] = { metrics: 0, platforms: new Set() };
      map[b.category].metrics++;
      map[b.category].platforms.add(b.platform);
    });
    return Object.entries(map).map(([cat, d]) => ({
      category: cat,
      metrics: d.metrics,
      platforms: d.platforms.size,
    })).sort((a, b) => b.metrics - a.metrics);
  }, [benchmarks]);

  const handleCreate = async () => {
    if (!newCategory || !newPlatform || !newMetric || !newValue) {
      toast.error("All fields are required");
      return;
    }
    try {
      await createBenchmark.mutateAsync({
        category: newCategory,
        platform: newPlatform,
        metric_name: newMetric,
        metric_value: parseFloat(newValue),
        sample_size: parseInt(newSampleSize) || 0,
      });
      toast.success("Benchmark added");
      setDialogOpen(false);
      setNewValue("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <DashboardLayout
      title="Benchmark Database"
      subtitle="Industry benchmarks by niche, platform, and metric"
      action={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Benchmark</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Industry Benchmark</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Platform</Label>
                <Select value={newPlatform} onValueChange={setNewPlatform}>
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>{platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Metric</Label>
                <Select value={newMetric} onValueChange={setNewMetric}>
                  <SelectTrigger><SelectValue placeholder="Select metric" /></SelectTrigger>
                  <SelectContent>{metricNames.map((m) => <SelectItem key={m} value={m}>{metricLabels[m]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Value</Label><Input type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="0" /></div>
                <div><Label>Sample Size</Label><Input type="number" value={newSampleSize} onChange={(e) => setNewSampleSize(e.target.value)} placeholder="1000" /></div>
              </div>
              <Button onClick={handleCreate} disabled={createBenchmark.isPending} className="w-full">
                {createBenchmark.isPending ? "Adding..." : "Add Benchmark"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Database className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Total Benchmarks</span></div>
          <p className="text-2xl font-bold">{benchmarks.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-blue-500" /><span className="text-xs text-muted-foreground">Categories</span></div>
          <p className="text-2xl font-bold">{categorySummary.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-emerald-500" /><span className="text-xs text-muted-foreground">Platforms</span></div>
          <p className="text-2xl font-bold">{new Set(benchmarks.map((b: any) => b.platform)).size}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-violet-500" /><span className="text-xs text-muted-foreground">Metrics Tracked</span></div>
          <p className="text-2xl font-bold">{new Set(benchmarks.map((b: any) => b.metric_name)).size}</p>
        </CardContent></Card>
      </div>

      {/* Category Summary */}
      {categorySummary.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Categories Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categorySummary.map((c) => (
                <button
                  key={c.category}
                  onClick={() => setFilterCategory(filterCategory === c.category ? "" : c.category)}
                  className={`bg-accent/50 rounded-lg p-3 text-left transition-colors ${filterCategory === c.category ? "ring-2 ring-primary" : ""}`}
                >
                  <p className="text-sm font-semibold">{c.category}</p>
                  <p className="text-[10px] text-muted-foreground">{c.metrics} benchmarks · {c.platforms} platforms</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All platforms" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        {(filterCategory || filterPlatform) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterCategory(""); setFilterPlatform(""); }}>Clear filters</Button>
        )}
      </div>

      {/* Benchmarks Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Benchmark Data</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : filteredBenchmarks.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No benchmarks yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add industry benchmarks to compare creator performance against market standards.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Sample Size</TableHead>
                  <TableHead>Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBenchmarks.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{b.category}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{b.platform}</Badge></TableCell>
                    <TableCell className="text-xs">{metricLabels[b.metric_name] || b.metric_name}</TableCell>
                    <TableCell className="text-right text-sm font-bold">
                      {b.metric_name.includes("rate") || b.metric_name.includes("growth") || b.metric_name.includes("watch_time")
                        ? `${b.metric_value}%`
                        : b.metric_name.includes("cpm") || b.metric_name.includes("cpa")
                          ? `$${b.metric_value}`
                          : b.metric_value >= 1000
                            ? `${(b.metric_value / 1000).toFixed(0)}K`
                            : b.metric_value}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{(b.sample_size || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.period || "monthly"}</TableCell>
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

export default BenchmarkDatabase;
