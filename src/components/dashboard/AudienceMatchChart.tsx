import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatorContent } from "@/hooks/useData";
import { useMemo } from "react";

const AudienceMatchChart = () => {
  const { data: content = [] } = useCreatorContent();

  const chartData = useMemo(() => {
    if (content.length === 0) return [];

    // Calculate average scores across different metrics
    const avgMatchScore = content.reduce((sum, c) => sum + (c.audience_match_score ?? 0), 0) / content.length;
    const avgPerfScore = content.reduce((sum, c) => sum + (c.performance_score ?? 0), 0) / content.length;
    const avgEngagement = content.reduce((sum, c) => {
      const totalEng = (c.likes ?? 0) + (c.comments ?? 0) + (c.shares ?? 0);
      const engRate = c.views ? (totalEng / c.views) * 100 : 0;
      return sum + engRate;
    }, 0) / content.length;
    
    const avgWatchTime = content.reduce((sum, c) => sum + (c.watch_time_pct ?? 0), 0) / content.length;
    const avgCompletion = content.reduce((sum, c) => sum + (c.completion_rate ?? 0), 0) / content.length;

    return [
      { metric: "Audience Match", target: 85, actual: Math.round(avgMatchScore) },
      { metric: "Performance", target: 80, actual: Math.round(avgPerfScore) },
      { metric: "Engagement", target: 75, actual: Math.min(100, Math.round(avgEngagement * 10)) },
      { metric: "Watch Time", target: 70, actual: Math.round(avgWatchTime) },
      { metric: "Completion", target: 65, actual: Math.round(avgCompletion) },
    ];
  }, [content]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Audience Match Quality</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No audience data yet. Submit content to see match quality.</p>
          </div>
        ) : (
          <>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid stroke="hsl(220, 13%, 91%)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar name="Target" dataKey="target" stroke="hsl(199, 89%, 48%)" fill="hsl(199, 89%, 48%)" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Actual" dataKey="actual" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-accent rounded" />
                Target
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-success rounded" />
                Actual
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AudienceMatchChart;
