import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import AudienceMatchChart from "@/components/dashboard/AudienceMatchChart";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock, Share2, MousePointerClick } from "lucide-react";
import { useCreatorContent, usePayroll } from "@/hooks/useData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const { data: content = [] } = useCreatorContent();
  const { data: payroll = [] } = usePayroll();

  // Calculate real metrics from content data
  const totalViews = content.reduce((sum, c) => sum + (c.views ?? 0), 0);
  const avgWatchTime = content.length > 0
    ? (content.reduce((sum, c) => sum + (c.watch_time_pct ?? 0), 0) / content.length).toFixed(1)
    : "0";
  const totalShares = content.reduce((sum, c) => sum + (c.shares ?? 0), 0);
  const avgCTR = content.length > 0
    ? (content.reduce((sum, c) => sum + (c.ctr ?? 0), 0) / content.length).toFixed(1)
    : "0";

  // Calculate spend by platform
  const platformSpend = content.reduce((acc, c) => {
    const platform = c.platform;
    if (!acc[platform]) acc[platform] = { spend: 0, count: 0 };
    
    // Find payroll for this content
    const contentPayroll = payroll.find(p => p.content_id === c.id);
    if (contentPayroll) {
      acc[platform].spend += contentPayroll.total_payment;
    }
    acc[platform].count += 1;
    return acc;
  }, {} as Record<string, { spend: number; count: number }>);

  const platformData = Object.entries(platformSpend).map(([platform, data]) => ({
    platform,
    spend: data.spend,
    count: data.count,
  }));

  // Format views for display
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatShares = (shares: number) => {
    if (shares >= 1000000) return `${(shares / 1000000).toFixed(1)}M`;
    if (shares >= 1000) return `${(shares / 1000).toFixed(0)}K`;
    return shares.toString();
  };

  return (
    <DashboardLayout title="Analytics" subtitle="Deep dive into your campaign performance metrics">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Views" 
          value={formatViews(totalViews)} 
          change={content.length > 0 ? `${content.length} pieces of content` : "No content yet"} 
          changeType={content.length > 0 ? "positive" : "neutral"} 
          icon={Eye} 
        />
        <StatCard 
          title="Avg Watch Time" 
          value={`${avgWatchTime}%`} 
          change={content.length > 0 ? "Average completion" : "No data yet"} 
          changeType={parseFloat(avgWatchTime) >= 50 ? "positive" : "neutral"} 
          icon={Clock} 
        />
        <StatCard 
          title="Total Shares" 
          value={formatShares(totalShares)} 
          change={content.length > 0 ? "Across all content" : "No shares yet"} 
          changeType={totalShares > 0 ? "positive" : "neutral"} 
          icon={Share2} 
        />
        <StatCard 
          title="Avg CTR" 
          value={`${avgCTR}%`} 
          change={content.length > 0 ? "Click-through rate" : "No data yet"} 
          changeType={parseFloat(avgCTR) >= 3 ? "positive" : "neutral"} 
          icon={MousePointerClick} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceChart />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Spend by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            {platformData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No platform data yet. Submit content to see analytics.</p>
              </div>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="platform" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 13%, 91%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Spend"]}
                    />
                    <Bar dataKey="spend" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AudienceMatchChart />
    </DashboardLayout>
  );
};

export default Analytics;
