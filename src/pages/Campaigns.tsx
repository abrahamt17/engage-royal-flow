import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CampaignTable from "@/components/dashboard/CampaignTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const platformOptions = ["TikTok", "Instagram", "YouTube", "X / Twitter", "Twitch"];

const Campaigns = () => {
  const { brandId } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [contentType, setContentType] = useState("video");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [basePay, setBasePay] = useState("500");
  const [multiplier, setMultiplier] = useState("2.5");
  const [conversionBonus, setConversionBonus] = useState("0");
  const [ageRange, setAgeRange] = useState("18-34");
  const [genders, setGenders] = useState("all");
  const [countries, setCountries] = useState("US");

  const createCampaign = useMutation({
    mutationFn: async () => {
      if (!brandId) throw new Error("No brand");
      const { error } = await supabase.from("campaigns").insert({
        brand_id: brandId,
        name,
        budget: parseFloat(budget) || 0,
        platforms,
        content_type: contentType,
        start_date: startDate || null,
        end_date: endDate || null,
        target_audience: {
          age_range: ageRange,
          genders,
          countries: countries.split(",").map((c) => c.trim()),
        },
        payroll_formula: {
          base_pay: parseFloat(basePay) || 500,
          performance_multiplier: parseFloat(multiplier) || 2.5,
          conversion_bonus: parseFloat(conversionBonus) || 0,
          audience_match_weight: 1.0,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created!");
      setOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => {
    setName("");
    setBudget("");
    setPlatforms([]);
    setContentType("video");
    setStartDate("");
    setEndDate("");
    setBasePay("500");
    setMultiplier("2.5");
    setConversionBonus("0");
    setAgeRange("18-34");
    setGenders("all");
    setCountries("US");
  };

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  return (
    <DashboardLayout title="Campaigns" subtitle="Create and manage your creator campaigns">
      <div className="flex justify-end mb-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCampaign.mutate();
              }}
              className="space-y-5 mt-2"
            >
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basic Info</h3>
                <div className="space-y-2">
                  <Label className="text-xs">Campaign Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Launch 2026" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Budget ($)</Label>
                    <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="10000" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="reel">Reel</SelectItem>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Platforms */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platforms</h3>
                <div className="flex flex-wrap gap-3">
                  {platformOptions.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={platforms.includes(p)}
                        onCheckedChange={() => togglePlatform(p)}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Audience</h3>
                <div className="grid grid-cols-2 gap-3">
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
                        <SelectItem value="55+">55+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Gender</Label>
                    <Select value={genders} onValueChange={setGenders}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Countries (comma-separated)</Label>
                  <Input value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="US, CA, UK" />
                </div>
              </div>

              {/* Payroll Formula */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payroll Formula</h3>
                <p className="text-xs text-muted-foreground">
                  Payment = BasePay × (PerfScore × MatchScore × Multiplier) + Bonus
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Base Pay ($)</Label>
                    <Input type="number" value={basePay} onChange={(e) => setBasePay(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Multiplier</Label>
                    <Input type="number" step="0.1" value={multiplier} onChange={(e) => setMultiplier(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Conv. Bonus ($)</Label>
                    <Input type="number" value={conversionBonus} onChange={(e) => setConversionBonus(e.target.value)} />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createCampaign.isPending}>
                {createCampaign.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <CampaignTable />
    </DashboardLayout>
  );
};

export default Campaigns;
