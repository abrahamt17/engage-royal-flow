import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const creators = [
  { name: "Mia Chen", handle: "@miachen", platform: "TikTok", followers: "2.4M", engagement: "8.2%", audienceMatch: 94, fraudRisk: "low", category: "Lifestyle", avatar: "MC" },
  { name: "Jake Williams", handle: "@jakew", platform: "YouTube", followers: "890K", engagement: "6.1%", audienceMatch: 91, fraudRisk: "low", category: "Tech", avatar: "JW" },
  { name: "Priya Patel", handle: "@priyap", platform: "Instagram", followers: "1.1M", engagement: "7.5%", audienceMatch: 89, fraudRisk: "low", category: "Fashion", avatar: "PP" },
  { name: "Carlos Rivera", handle: "@carlosr", platform: "TikTok", followers: "3.2M", engagement: "9.8%", audienceMatch: 87, fraudRisk: "medium", category: "Entertainment", avatar: "CR" },
  { name: "Emma Davis", handle: "@emmad", platform: "Multi", followers: "560K", engagement: "11.2%", audienceMatch: 85, fraudRisk: "low", category: "Fitness", avatar: "ED" },
  { name: "Liam Park", handle: "@liamp", platform: "YouTube", followers: "1.8M", engagement: "5.4%", audienceMatch: 82, fraudRisk: "low", category: "Gaming", avatar: "LP" },
];

const riskStyles: Record<string, string> = {
  low: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
};

const Creators = () => {
  return (
    <DashboardLayout title="Creators" subtitle="Discover and manage creator partnerships">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search creators..." className="pl-9" />
        </div>
        <Button variant="outline">Filters</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creators.map((c, i) => (
          <Card key={i} className="hover:border-accent/30 transition-colors cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-foreground">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.handle} · {c.platform}</p>
                </div>
                <Badge variant="outline" className={riskStyles[c.fraudRisk]}>
                  {c.fraudRisk} risk
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Followers</p>
                  <p className="text-sm font-semibold text-card-foreground">{c.followers}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                  <p className="text-sm font-semibold text-card-foreground">{c.engagement}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Match</p>
                  <p className="text-sm font-semibold text-accent">{c.audienceMatch}%</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <Badge variant="secondary" className="text-xs">{c.category}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Creators;
