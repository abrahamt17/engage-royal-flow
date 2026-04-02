import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Upload, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCreators } from "@/hooks/useData";

const platformOptions = ["TikTok", "Instagram", "YouTube", "X / Twitter", "Twitch"];
const categoryOptions = ["Fashion", "Tech", "Gaming", "Beauty", "Fitness", "Food", "Travel", "Music", "Comedy", "Education", "Lifestyle"];

const CreatorOnboarding = () => {
  const queryClient = useQueryClient();
  const { data: creators = [] } = useCreators();

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [engagementRate, setEngagementRate] = useState("");
  const [ageRange, setAgeRange] = useState("18-34");
  const [topCountries, setTopCountries] = useState("US");
  const [gender, setGender] = useState("mixed");

  const createCreator = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("creators").insert({
        name,
        handle,
        platforms,
        category: category || null,
        follower_count: parseInt(followerCount) || 0,
        avg_engagement_rate: parseFloat(engagementRate) || 0,
        audience_demographics: {
          age_range: ageRange,
          top_countries: topCountries.split(",").map((c) => c.trim()).filter(Boolean),
          gender_split: gender,
        },
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creators"] });
      toast.success("Creator onboarded successfully!");
      resetForm();
    },
    onError: (e: { message?: string }) => {
      toast.error(e.message ?? "Failed to onboard creator");
    },
  });

  const resetForm = () => {
    setName(""); setHandle(""); setPlatforms([]); setCategory("");
    setFollowerCount(""); setEngagementRate(""); setAgeRange("18-34");
    setTopCountries("US"); setGender("mixed");
  };

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  return (
    <DashboardLayout title="Creator Onboarding" subtitle="Add and manage creators for your campaigns">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Onboarding Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" /> Add New Creator
              </CardTitle>
              <CardDescription className="text-xs">Enter creator details to onboard them into the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); createCreator.mutate(); }} className="space-y-5">
                {/* Identity */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identity</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Full Name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Handle</Label>
                      <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@alexjohnson" required />
                    </div>
                  </div>
                </div>

                {/* Platforms */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platforms</h3>
                  <div className="flex flex-wrap gap-3">
                    {platformOptions.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={platforms.includes(p)} onCheckedChange={() => togglePlatform(p)} />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Profile */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profile</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Followers</Label>
                      <Input type="number" value={followerCount} onChange={(e) => setFollowerCount(e.target.value)} placeholder="50000" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Engagement Rate (%)</Label>
                      <Input type="number" step="0.1" value={engagementRate} onChange={(e) => setEngagementRate(e.target.value)} placeholder="4.5" />
                    </div>
                  </div>
                </div>

                {/* Audience Demographics */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audience Demographics</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Age Range</Label>
                      <Select value={ageRange} onValueChange={setAgeRange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="13-17">13-17</SelectItem>
                          <SelectItem value="18-24">18-24</SelectItem>
                          <SelectItem value="18-34">18-34</SelectItem>
                          <SelectItem value="25-44">25-44</SelectItem>
                          <SelectItem value="35-54">35-54</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Gender Split</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mixed">Mixed</SelectItem>
                          <SelectItem value="male_dominant">Male Dominant</SelectItem>
                          <SelectItem value="female_dominant">Female Dominant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Top Countries</Label>
                      <Input value={topCountries} onChange={(e) => setTopCountries(e.target.value)} placeholder="US, UK, CA" />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createCreator.isPending}>
                  {createCreator.isPending ? "Onboarding..." : "Onboard Creator"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Creators */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Recent Creators
              </CardTitle>
              <CardDescription className="text-xs">{creators.length} total creators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {creators.slice(0, 15).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.handle} · {c.platforms?.join(", ")}</p>
                  </div>
                  {c.category && <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreatorOnboarding;
