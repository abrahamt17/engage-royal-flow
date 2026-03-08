import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import AudienceMatchChart from "@/components/dashboard/AudienceMatchChart";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Clock, Share2, MousePointerClick } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const platformData = [
  { platform: "TikTok", spend: 82000, conversions: 4200 },
  { platform: "Instagram", spend: 64000, conversions: 2800 },
  { platform: "YouTube", spend: 58000, conversions: 3100 },
  { platform: "X / Twitter", spend: 18000, conversions: 890 },
  { platform: "Twitch", spend: 8000, conversions: 420 },
];

const Analytics = () => {
  return (
    <DashboardLayout title="Analytics" subtitle="Deep dive into your campaign performance metrics">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Views" value="48.2M" change="+18% this month" changeType="positive" icon={Eye} />
        <StatCard title="Avg Watch Time" value="68%" change="+5.2% vs target" changeType="positive" icon={Clock} />
        <StatCard title="Total Shares" value="1.2M" change="+22% growth" changeType="positive" icon={Share2} />
        <StatCard title="Click-through Rate" value="4.8%" change="+0.6% improvement" changeType="positive" icon={MousePointerClick} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceChart />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Spend by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="platform" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Bar dataKey="spend" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <AudienceMatchChart />
    </DashboardLayout>
  );
};

export default Analytics;
