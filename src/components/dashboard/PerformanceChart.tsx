import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatorContent, usePayroll } from "@/hooks/useData";
import { useMemo } from "react";

const PerformanceChart = () => {
  const { data: content = [] } = useCreatorContent();
  const { data: payroll = [] } = usePayroll();

  const chartData = useMemo(() => {
    // Group content and payroll by month
    const monthlyData: Record<string, { spend: number; views: number }> = {};
    
    content.forEach((c) => {
      const date = new Date(c.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { spend: 0, views: 0 };
      }
      
      monthlyData[monthKey].views += c.views ?? 0;
      
      // Find associated payroll
      const contentPayroll = payroll.find(p => p.content_id === c.id);
      if (contentPayroll) {
        monthlyData[monthKey].spend += contentPayroll.total_payment;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      name: month,
      spend: Math.round(data.spend),
      views: data.views,
    }));
  }, [content, payroll]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Spend vs Views</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No performance data yet. Submit content to see trends.</p>
          </div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11 }} 
                  stroke="hsl(215, 16%, 47%)" 
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }} 
                  stroke="hsl(215, 16%, 47%)" 
                  tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 13%, 91%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "Spend") return [`$${value.toLocaleString()}`, name];
                    return [value.toLocaleString(), name];
                  }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="spend" 
                  stroke="hsl(199, 89%, 48%)" 
                  fill="url(#spendGrad)" 
                  strokeWidth={2} 
                  name="Spend" 
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(142, 71%, 45%)" 
                  fill="url(#viewsGrad)" 
                  strokeWidth={2} 
                  name="Views" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
