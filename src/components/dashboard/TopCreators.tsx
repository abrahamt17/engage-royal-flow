import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreators } from "@/hooks/useData";

const platformColors: Record<string, string> = {
  TikTok: "bg-accent/10 text-accent border-accent/20",
  YouTube: "bg-destructive/10 text-destructive border-destructive/20",
  Instagram: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

const TopCreators = () => {
  const { data: creators = [] } = useCreators();
  const top5 = creators.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Top Performing Creators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {top5.length === 0 && (
          <p className="text-sm text-muted-foreground">No creators yet.</p>
        )}
        {top5.map((c) => {
          const mainPlatform = c.platforms?.[0] ?? "Other";
          return (
            <div key={c.id} className="flex items-center gap-3 py-1.5">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
                {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.handle}</p>
              </div>
              <Badge variant="outline" className={platformColors[mainPlatform] ?? "bg-muted text-muted-foreground border-border"}>
                {mainPlatform}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-semibold text-card-foreground">
                  {c.follower_count ? `${(c.follower_count / 1000).toFixed(0)}K` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">{c.avg_engagement_rate}% eng</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TopCreators;
