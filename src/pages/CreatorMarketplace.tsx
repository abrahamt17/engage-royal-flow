import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Star, Shield, TrendingUp, MapPin, Globe, Filter, X } from "lucide-react";
import { useMarketplaceCreators } from "@/hooks/useMarketplaceData";
import CreatorTrustDialog from "@/components/marketplace/CreatorTrustDialog";

const categories = ["Tech", "Beauty", "Fitness", "Gaming", "Food", "Travel", "Fashion", "Education", "Finance", "Lifestyle"];
const platforms = ["TikTok", "Instagram", "YouTube", "Twitter", "Twitch"];

const CreatorMarketplace = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [engagementRange, setEngagementRange] = useState([0, 20]);
  const [followerRange, setFollowerRange] = useState([0, 10000000]);
  const [minTrust, setMinTrust] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);

  const { data: creators = [], isLoading } = useMarketplaceCreators({
    search,
    category: category || undefined,
    minEngagement: engagementRange[0] || undefined,
    maxEngagement: engagementRange[1] < 20 ? engagementRange[1] : undefined,
    minFollowers: followerRange[0] || undefined,
    maxFollowers: followerRange[1] < 10000000 ? followerRange[1] : undefined,
    platform: platform || undefined,
    minTrustScore: minTrust || undefined,
  });

  const getTrustColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    if (score >= 40) return "text-orange-500";
    return "text-destructive";
  };

  const getTrustLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Low";
  };

  const calcFitScore = (c: any) => {
    const engQuality = Math.min((c.avg_engagement_rate || 0) / 10, 1);
    const audienceAuth = (c.audience_authenticity || 50) / 100;
    const trustNorm = (c.trust_score || 50) / 100;
    const categoryMatch = category && c.category?.toLowerCase() === category.toLowerCase() ? 1 : 0.5;
    return Math.round((0.40 * audienceAuth + 0.25 * categoryMatch + 0.20 * engQuality + 0.15 * trustNorm) * 100);
  };

  const clearFilters = () => {
    setCategory("");
    setPlatform("");
    setEngagementRange([0, 20]);
    setFollowerRange([0, 10000000]);
    setMinTrust(0);
  };

  return (
    <DashboardLayout title="Creator Marketplace" subtitle="Discover and match with top creators">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search creators by name, handle, or niche..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" /> Filters
        </Button>
        {(category || platform || minTrust > 0) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="mb-6 animate-fade-in">
          <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue placeholder="All platforms" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  {platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Engagement Rate: {engagementRange[0]}% – {engagementRange[1]}%
              </label>
              <Slider min={0} max={20} step={0.5} value={engagementRange} onValueChange={setEngagementRange} className="mt-3" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Min Trust Score: {minTrust}
              </label>
              <Slider min={0} max={100} step={5} value={[minTrust]} onValueChange={([v]) => setMinTrust(v)} className="mt-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading marketplace...</p>
      ) : creators.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No creators found matching your criteria.</p>
          <p className="text-xs text-muted-foreground mt-1">Creators need to be listed on the marketplace to appear here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {creators.map((c: any, i: number) => {
            const fitScore = calcFitScore(c);
            return (
              <Card
                key={c.id}
                className="hover:border-primary/30 transition-all cursor-pointer animate-fade-in group"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => setSelectedCreator(c.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {c.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-card-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.handle}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {c.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" /> {c.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTrustColor(c.trust_score || 50)}`}>
                        {c.trust_score ?? 50}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Trust Score</p>
                    </div>
                  </div>

                  {/* Fit Score Bar */}
                  <div className="mb-3 p-2 rounded-lg bg-accent/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">AI Fit Score</span>
                      <span className="text-xs font-bold text-primary">{fitScore}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${fitScore}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Followers</p>
                      <p className="text-xs font-semibold">
                        {c.follower_count >= 1000000
                          ? `${(c.follower_count / 1000000).toFixed(1)}M`
                          : c.follower_count >= 1000
                            ? `${(c.follower_count / 1000).toFixed(0)}K`
                            : c.follower_count ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Engagement</p>
                      <p className="text-xs font-semibold">{c.avg_engagement_rate ?? 0}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Campaigns</p>
                      <p className="text-xs font-semibold">{c.total_campaigns_completed ?? 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {c.category && <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>}
                    {c.platforms?.map((p: string) => (
                      <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                    ))}
                  </div>

                  {(c.price_range_min > 0 || c.price_range_max > 0) && (
                    <p className="text-xs text-muted-foreground mt-2">
                      💰 ${c.price_range_min?.toLocaleString()} – ${c.price_range_max?.toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedCreator && (
        <CreatorTrustDialog
          open={!!selectedCreator}
          onOpenChange={(open) => !open && setSelectedCreator(null)}
          creatorId={selectedCreator}
        />
      )}
    </DashboardLayout>
  );
};

export default CreatorMarketplace;
