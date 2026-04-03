import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCampaignCreators } from "@/hooks/useData";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, TrendingUp, Wand2 } from "lucide-react";

type ImportMetricsResult = {
  success: boolean;
  platform: string;
  importStatus: "complete" | "partial" | "manual_required";
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    watch_time_pct?: number;
  };
  metadata?: {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
    published_at?: string;
    external_id?: string;
  };
  message?: string;
};

const SubmitContent = () => {
  const queryClient = useQueryClient();
  const { data: assignments = [] } = useCampaignCreators();

  const [assignmentId, setAssignmentId] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [contentUrl, setContentUrl] = useState("");
  const [views, setViews] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [saves, setSaves] = useState("");
  const [watchTime, setWatchTime] = useState("");
  const [importedMetadata, setImportedMetadata] = useState<ImportMetricsResult["metadata"] | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [calculatedPayout, setCalculatedPayout] = useState<any>(null);

  const selectedAssignment = assignments.find((a: any) => a.id === assignmentId);

  const calculatePreview = () => {
    if (!views || !likes || !watchTime) {
      toast.error("Please fill in views, likes, and watch time to preview");
      return;
    }

    const v = parseInt(views) || 0;
    const l = parseInt(likes) || 0;
    const wt = parseFloat(watchTime) || 0;
    
    // Simple performance score calculation (0-1)
    const engagementRate = v > 0 ? (l / v) * 100 : 0;
    const perfScore = Math.min(1, (engagementRate / 10) * (wt / 100));
    
    // Match score (simplified)
    const matchScore = 0.85;
    
    // Base pay and multiplier
    const basePay = selectedAssignment?.base_pay ?? 500;
    const multiplier = 2.5;
    
    const totalPayout = basePay * (perfScore * matchScore * multiplier);
    
    setCalculatedPayout({
      basePay,
      perfScore: perfScore.toFixed(2),
      matchScore: matchScore.toFixed(2),
      multiplier,
      total: totalPayout.toFixed(2),
      engagementRate: engagementRate.toFixed(2),
    });
    
    setShowPreview(true);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      const { data, error } = await supabase.functions.invoke("submit-metrics", {
        body: {
          campaign_creator_id: assignmentId,
          platform,
          content_url: contentUrl,
          views: parseInt(views) || 0,
          likes: parseInt(likes) || 0,
          comments: parseInt(comments) || 0,
          shares: parseInt(shares) || 0,
          saves: parseInt(saves) || 0,
          watch_time_pct: parseFloat(watchTime) || 0,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Content submitted! Payroll calculated automatically.");
      queryClient.invalidateQueries({ queryKey: ["campaign_creators"] });
      queryClient.invalidateQueries({ queryKey: ["creator_content"] });
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit content");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      setIsImporting(true);
      const { data, error } = await supabase.functions.invoke("import-content-metrics", {
        body: {
          content_url: contentUrl,
        },
      });
      if (error) throw error;
      return data as ImportMetricsResult;
    },
    onSuccess: (data) => {
      if (data.platform && data.platform !== "Unknown") {
        setPlatform(data.platform);
      }

      if (data.metrics) {
        if (data.metrics.views != null) setViews(String(data.metrics.views));
        if (data.metrics.likes != null) setLikes(String(data.metrics.likes));
        if (data.metrics.comments != null) setComments(String(data.metrics.comments));
        if (data.metrics.shares != null) setShares(String(data.metrics.shares));
        if (data.metrics.saves != null) setSaves(String(data.metrics.saves));
        if (data.metrics.watch_time_pct != null) setWatchTime(String(data.metrics.watch_time_pct));
      }

      setImportedMetadata(data.metadata ?? null);

      if (data.importStatus === "complete") {
        toast.success(data.message ?? "Metrics imported successfully.");
      } else if (data.importStatus === "partial") {
        toast.info(data.message ?? "Imported what was available. Fill in the rest manually.");
      } else {
        toast.warning(data.message ?? "Automatic import is not available for this URL yet.");
      }
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Failed to import metrics");
    },
    onSettled: () => {
      setIsImporting(false);
    },
  });

  const resetForm = () => {
    setAssignmentId("");
    setPlatform("TikTok");
    setContentUrl("");
    setViews("");
    setLikes("");
    setComments("");
    setShares("");
    setSaves("");
    setWatchTime("");
    setImportedMetadata(null);
    setShowPreview(false);
    setCalculatedPayout(null);
  };

  const isFormValid = assignmentId && contentUrl && views && likes && watchTime;

  return (
    <DashboardLayout title="Submit Content" subtitle="Submit content metrics to auto-calculate payroll">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Content Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitMutation.mutate();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-xs">Campaign Assignment</Label>
                    <Select value={assignmentId} onValueChange={setAssignmentId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignments.map((a: any) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.campaigns?.name} - {a.creators?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedAssignment && (
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Base Pay: ${selectedAssignment.base_pay}</Badge>
                        <Badge variant="outline">Status: {selectedAssignment.status}</Badge>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Platform *</Label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TikTok">TikTok</SelectItem>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="YouTube">YouTube</SelectItem>
                          <SelectItem value="X / Twitter">X / Twitter</SelectItem>
                          <SelectItem value="Twitch">Twitch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Content URL *</Label>
                      <Input 
                        value={contentUrl} 
                        onChange={(e) => setContentUrl(e.target.value)} 
                        placeholder="https://..." 
                        required
                        type="url"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => importMutation.mutate()}
                      disabled={!contentUrl || isImporting}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      {isImporting ? "Importing..." : "Import From URL"}
                    </Button>
                    <div className="text-xs text-muted-foreground flex items-center">
                      Detect platform and autofill what the backend can fetch. Manual entry still works.
                    </div>
                  </div>

                  {importedMetadata && (
                    <Alert>
                      <AlertDescription className="text-xs space-y-1">
                        {importedMetadata.title && <div>Title: {importedMetadata.title}</div>}
                        {importedMetadata.author_name && <div>Author: {importedMetadata.author_name}</div>}
                        {importedMetadata.published_at && <div>Published: {new Date(importedMetadata.published_at).toLocaleDateString()}</div>}
                        {importedMetadata.external_id && <div>External ID: {importedMetadata.external_id}</div>}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Required fields: Views, Likes, Watch Time %. Optional: Comments, Shares, Saves. URL import can prefill some fields when supported.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Views *</Label>
                      <Input 
                        type="number" 
                        value={views} 
                        onChange={(e) => setViews(e.target.value)} 
                        placeholder="0" 
                        required
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Likes *</Label>
                      <Input 
                        type="number" 
                        value={likes} 
                        onChange={(e) => setLikes(e.target.value)} 
                        placeholder="0" 
                        required
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Comments</Label>
                      <Input 
                        type="number" 
                        value={comments} 
                        onChange={(e) => setComments(e.target.value)} 
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Shares</Label>
                      <Input 
                        type="number" 
                        value={shares} 
                        onChange={(e) => setShares(e.target.value)} 
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Saves</Label>
                      <Input 
                        type="number" 
                        value={saves} 
                        onChange={(e) => setSaves(e.target.value)} 
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Watch Time % *</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={watchTime} 
                        onChange={(e) => setWatchTime(e.target.value)} 
                        placeholder="0.0" 
                        required
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={calculatePreview}
                      disabled={!isFormValid}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Preview Payout
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isSubmitting || !isFormValid}
                    >
                      {isSubmitting ? "Submitting..." : "Submit & Calculate Payroll"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className={showPreview && calculatedPayout ? "border-success" : ""}>
              <CardHeader>
                <CardTitle className="text-sm">Payout Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {!showPreview || !calculatedPayout ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-sm text-muted-foreground">Fill in metrics and click "Preview Payout"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-success/20 bg-success/5">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <AlertDescription className="text-xs text-success">
                        Estimated payout calculation
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Base Pay</span>
                        <span className="font-medium text-card-foreground">${calculatedPayout.basePay}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Performance Score</span>
                        <span className="font-mono text-card-foreground">{calculatedPayout.perfScore}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Match Score</span>
                        <span className="font-mono text-card-foreground">{calculatedPayout.matchScore}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Multiplier</span>
                        <span className="font-mono text-card-foreground">{calculatedPayout.multiplier}x</span>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-foreground">Estimated Total</span>
                          <span className="text-2xl font-bold text-success">${calculatedPayout.total}</span>
                        </div>
                      </div>
                      <div className="pt-2 text-xs text-muted-foreground">
                        Engagement Rate: {calculatedPayout.engagementRate}%
                      </div>
                    </div>

                    <Alert>
                      <AlertDescription className="text-xs">
                        Formula: BasePay × (PerfScore × MatchScore × Multiplier)
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmitContent;
