import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const creators = [
  { name: "Mia Chen", handle: "@miachen", platform: "TikTok", score: 94, earnings: "$4,280", avatar: "MC" },
  { name: "Jake Williams", handle: "@jakew", platform: "YouTube", score: 91, earnings: "$3,920", avatar: "JW" },
  { name: "Priya Patel", handle: "@priyap", platform: "Instagram", score: 89, earnings: "$3,150", avatar: "PP" },
  { name: "Carlos Rivera", handle: "@carlosr", platform: "TikTok", score: 87, earnings: "$2,890", avatar: "CR" },
  { name: "Emma Davis", handle: "@emmad", platform: "Multi", score: 85, earnings: "$2,640", avatar: "ED" },
];

const platformColors: Record<string, string> = {
  TikTok: "bg-accent/10 text-accent border-accent/20",
  YouTube: "bg-destructive/10 text-destructive border-destructive/20",
  Instagram: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Multi: "bg-muted text-muted-foreground border-border",
};

const TopCreators = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Top Performing Creators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {creators.map((c, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
              {c.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.handle}</p>
            </div>
            <Badge variant="outline" className={platformColors[c.platform]}>
              {c.platform}
            </Badge>
            <div className="text-right">
              <p className="text-sm font-semibold text-card-foreground">{c.earnings}</p>
              <p className="text-xs text-muted-foreground">Score: {c.score}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TopCreators;
