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
import { toast } from "sonner";

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

  const submitMutation = useMutation({
    mutationFn: async () => {
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
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit content");
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
  };

  return (
    <DashboardLayout title="Submit Content" subtitle="Submit content metrics to auto-calculate payroll">
      <div className="max-w-2xl mx-auto">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Platform</Label>
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
                  <Label className="text-xs">Content URL</Label>
                  <Input value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Views</Label>
                  <Input type="number" value={views} onChange={(e) => setViews(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Likes</Label>
                  <Input type="number" value={likes} onChange={(e) => setLikes(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Comments</Label>
                  <Input type="number" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Shares</Label>
                  <Input type="number" value={shares} onChange={(e) => setShares(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Saves</Label>
                  <Input type="number" value={saves} onChange={(e) => setSaves(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Watch Time %</Label>
                  <Input type="number" step="0.01" value={watchTime} onChange={(e) => setWatchTime(e.target.value)} placeholder="0.0" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Submitting..." : "Submit & Calculate Payroll"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SubmitContent;
