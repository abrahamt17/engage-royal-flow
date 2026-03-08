import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { metric: "Location", target: 90, actual: 82 },
  { metric: "Age", target: 85, actual: 78 },
  { metric: "Interests", target: 80, actual: 85 },
  { metric: "Gender", target: 75, actual: 72 },
  { metric: "Language", target: 95, actual: 91 },
  { metric: "Authenticity", target: 90, actual: 86 },
];

const AudienceMatchChart = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Audience Match Quality</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="hsl(220, 13%, 91%)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
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
      </CardContent>
    </Card>
  );
};

export default AudienceMatchChart;
