import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, Loader2, Play, Pause, Zap, Target, Users, DollarSign, Sparkles } from "lucide-react";
import { useCampaignAutomations } from "@/hooks/useAdvancedData";
import { useCampaigns } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CampaignAutomation = () => {
  const { brandId } = useAuth();
  const { data: automations = [], isLoading, refetch } = useCampaignAutomations();
  const { data: campaigns = [] } = useCampaigns();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [running, setRunning] = useState(false);

  // New automation form
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [budget, setBudget] = useState("");
  const [goal, setGoal] = useState("");
  const [autoType, setAutoType] = useState("creator_selection");

  const handleCreateAutomation = async () => {
    if (!selectedCampaign || !brandId) {
      toast.error("Select a campaign");
      return;
    }
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("campaign-autopilot", {
        body: {
          campaign_id: selectedCampaign,
          brand_id: brandId,
          automation_type: autoType,
          config: {
            target_audience: targetAudience,
            budget: parseFloat(budget) || 0,
            goal,
          },
        },
      });
      if (error) throw error;
      toast.success("Automation created and running!");
      refetch();
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to create automation");
    } finally {
      setRunning(false);
    }
  };

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    paused: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    completed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const typeLabels: Record<string, string> = {
    creator_selection: "Creator Auto-Select",
    budget_optimization: "Budget Optimization",
    spend_pacing: "Spend Pacing",
    performance_optimization: "Performance Optimizer",
  };

  return (
    <DashboardLayout
      title="Campaign Automation"
      subtitle="AI-powered campaign autopilot"
      action={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Bot className="h-4 w-4 mr-2" /> New Automation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Campaign Automation</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Campaign</Label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Automation Type</Label>
                <Select value={autoType} onValueChange={setAutoType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creator_selection">AI Creator Selection</SelectItem>
                    <SelectItem value="budget_optimization">Budget Optimization</SelectItem>
                    <SelectItem value="spend_pacing">Spend Pacing</SelectItem>
                    <SelectItem value="performance_optimization">Performance Optimizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audience</Label>
                <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. US college students, tech enthusiasts" />
              </div>
              <div>
                <Label>Budget ($)</Label>
                <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="20000" />
              </div>
              <div>
                <Label>Goal</Label>
                <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. 100k app installs, 50k website visits" rows={2} />
              </div>
              <Button onClick={handleCreateAutomation} disabled={running} className="w-full">
                {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running AI...</> : <><Zap className="h-4 w-4 mr-2" /> Launch Automation</>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Automations</span>
            </div>
            <p className="text-2xl font-bold">{automations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Play className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold">{automations.filter((a: any) => a.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Creators Matched</span>
            </div>
            <p className="text-2xl font-bold">
              {automations.reduce((s: number, a: any) => s + ((a.results as any)?.creators_matched || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Budget Managed</span>
            </div>
            <p className="text-2xl font-bold">
              ${automations.reduce((s: number, a: any) => s + ((a.config as any)?.budget || 0), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Automation List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : automations.length === 0 ? (
        <Card className="p-12 text-center">
          <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No automations yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Create one to let AI manage your campaigns.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {automations.map((auto: any) => {
            const config = auto.config || {};
            const results = auto.results || {};
            return (
              <Card key={auto.id} className="animate-fade-in">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold">{typeLabels[auto.automation_type] || auto.automation_type}</p>
                        <Badge variant="outline" className={statusStyles[auto.status] || ""}>{auto.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Campaign: {auto.campaigns?.name ?? "—"}</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      {auto.status === "active" ? <><Pause className="h-3 w-3 mr-1" /> Pause</> : <><Play className="h-3 w-3 mr-1" /> Resume</>}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {config.target_audience && (
                      <div className="bg-accent/50 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">Target</p>
                        <p className="text-xs font-medium">{config.target_audience}</p>
                      </div>
                    )}
                    {config.budget > 0 && (
                      <div className="bg-accent/50 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">Budget</p>
                        <p className="text-xs font-medium">${config.budget.toLocaleString()}</p>
                      </div>
                    )}
                    {results.creators_matched > 0 && (
                      <div className="bg-accent/50 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">Matched</p>
                        <p className="text-xs font-medium">{results.creators_matched} creators</p>
                      </div>
                    )}
                    {config.goal && (
                      <div className="bg-accent/50 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">Goal</p>
                        <p className="text-xs font-medium truncate">{config.goal}</p>
                      </div>
                    )}
                  </div>
                  {results.recommendation && (
                    <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
                      <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" /> {results.recommendation}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CampaignAutomation;
