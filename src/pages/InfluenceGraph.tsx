import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Share2, Users, Network, TrendingUp, Eye } from "lucide-react";
import { useCreators, useCampaignCreators } from "@/hooks/useData";

const InfluenceGraph = () => {
  const { data: creators = [], isLoading } = useCreators();
  const { data: campaignCreators = [] } = useCampaignCreators();

  // Calculate influence metrics
  const influenceData = useMemo(() => {
    if (creators.length === 0) return [];

    // Build co-campaign adjacency for network overlap
    const creatorCampaigns: Record<string, Set<string>> = {};
    campaignCreators.forEach((cc: any) => {
      if (!creatorCampaigns[cc.creator_id]) creatorCampaigns[cc.creator_id] = new Set();
      creatorCampaigns[cc.creator_id].add(cc.campaign_id);
    });

    return creators.map((c) => {
      const myCampaigns = creatorCampaigns[c.id] || new Set();

      // Co-campaign overlap scores with other creators
      const overlaps: { creatorId: string; creatorName: string; overlap: number }[] = [];
      creators.forEach((other) => {
        if (other.id === c.id) return;
        const otherCampaigns = creatorCampaigns[other.id] || new Set();
        if (myCampaigns.size === 0 && otherCampaigns.size === 0) return;
        const intersection = [...myCampaigns].filter((x) => otherCampaigns.has(x)).length;
        const union = new Set([...myCampaigns, ...otherCampaigns]).size;
        const overlap = union > 0 ? (intersection / union) * 100 : 0;
        if (overlap > 0) overlaps.push({ creatorId: other.id, creatorName: other.name, overlap });
      });

      overlaps.sort((a, b) => b.overlap - a.overlap);

      // Centrality: based on connections + engagement
      const connections = overlaps.length;
      const engNorm = Math.min((c.avg_engagement_rate || 0) / 10, 1);
      const followNorm = Math.min((c.follower_count || 0) / 1000000, 1);
      const centrality = Math.round((connections / Math.max(creators.length - 1, 1)) * 40 + engNorm * 35 + followNorm * 25);

      // Community cluster by category
      const cluster = c.category || "General";

      return {
        ...c,
        overlaps: overlaps.slice(0, 5),
        connections,
        centrality,
        cluster,
        campaignCount: myCampaigns.size,
      };
    }).sort((a, b) => b.centrality - a.centrality);
  }, [creators, campaignCreators]);

  // Cluster summary
  const clusters = useMemo(() => {
    const map: Record<string, { count: number; avgCentrality: number; totalFollowers: number }> = {};
    influenceData.forEach((c) => {
      if (!map[c.cluster]) map[c.cluster] = { count: 0, avgCentrality: 0, totalFollowers: 0 };
      map[c.cluster].count++;
      map[c.cluster].avgCentrality += c.centrality;
      map[c.cluster].totalFollowers += c.follower_count || 0;
    });
    return Object.entries(map).map(([name, d]) => ({
      name,
      count: d.count,
      avgCentrality: d.count > 0 ? Math.round(d.avgCentrality / d.count) : 0,
      totalFollowers: d.totalFollowers,
    })).sort((a, b) => b.avgCentrality - a.avgCentrality);
  }, [influenceData]);

  const totalConnections = influenceData.reduce((s, c) => s + c.connections, 0) / 2;

  return (
    <DashboardLayout title="Creator Network" subtitle="Co-campaign network analysis and creator relationship mapping">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Creators</span></div>
          <p className="text-2xl font-bold">{creators.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Network className="h-4 w-4 text-violet-500" /><span className="text-xs text-muted-foreground">Connections</span></div>
          <p className="text-2xl font-bold">{totalConnections}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Share2 className="h-4 w-4 text-blue-500" /><span className="text-xs text-muted-foreground">Communities</span></div>
          <p className="text-2xl font-bold">{clusters.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-emerald-500" /><span className="text-xs text-muted-foreground">Avg Centrality</span></div>
          <p className="text-2xl font-bold">{influenceData.length > 0 ? Math.round(influenceData.reduce((s, c) => s + c.centrality, 0) / influenceData.length) : 0}</p>
        </CardContent></Card>
      </div>

      {/* Community Clusters */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Community Clusters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {clusters.map((cluster) => (
              <div key={cluster.name} className="bg-accent/50 rounded-lg p-3">
                <p className="text-sm font-semibold">{cluster.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{cluster.count} creators</span>
                  <Badge variant="outline" className="text-[10px]">Centrality: {cluster.avgCentrality}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {cluster.totalFollowers >= 1000000 ? `${(cluster.totalFollowers / 1000000).toFixed(1)}M` : `${(cluster.totalFollowers / 1000).toFixed(0)}K`} total followers
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Creator Network Cards */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {influenceData.slice(0, 12).map((c, i) => (
            <Card key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {c.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.handle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{c.centrality}</p>
                    <p className="text-[10px] text-muted-foreground">Centrality</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Connections</p>
                    <p className="text-xs font-bold">{c.connections}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Campaigns</p>
                    <p className="text-xs font-bold">{c.campaignCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Cluster</p>
                    <Badge variant="secondary" className="text-[10px]">{c.cluster}</Badge>
                  </div>
                </div>

                {/* Co-Campaign Overlaps */}
                {c.overlaps.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-2">CO-CAMPAIGN OVERLAP</p>
                    <div className="space-y-1.5">
                      {c.overlaps.map((o) => (
                        <div key={o.creatorId} className="flex items-center gap-2">
                          <span className="text-xs truncate flex-1">{o.creatorName}</span>
                          <Progress value={o.overlap} className="h-1 w-16" />
                          <span className="text-[10px] font-medium w-8 text-right">{o.overlap.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Based on shared campaign history, not direct audience-identity data.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default InfluenceGraph;
