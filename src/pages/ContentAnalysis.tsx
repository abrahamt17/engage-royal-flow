import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Brain, Shield, Smile, Volume2, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { useAllContentAnalyses } from "@/hooks/useMarketplaceData";
import { useCreatorContent } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ContentAnalysis = () => {
  const { data: analyses = [], isLoading, refetch } = useAllContentAnalyses();
  const { data: contentList = [] } = useCreatorContent();
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!selectedContentId) {
      toast.error("Select content to analyze");
      return;
    }
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-content", {
        body: { content_id: selectedContentId, description: contentDescription },
      });
      if (error) throw error;
      toast.success("Content analyzed successfully");
      refetch();
      setDialogOpen(false);
      setContentDescription("");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const ScoreCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color} shrink-0`} />
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-bold">{value.toFixed(0)}/100</span>
        </div>
        <Progress value={value} className="h-1.5" />
      </div>
    </div>
  );

  return (
    <DashboardLayout
      title="AI Content Analysis"
      subtitle="AI-powered video and content quality analysis"
      action={
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Sparkles className="h-4 w-4 mr-2" /> Analyze Content
        </Button>
      }
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Analyzed</span>
            </div>
            <p className="text-2xl font-bold">{analyses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Smile className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Avg Sentiment</span>
            </div>
            <p className="text-2xl font-bold">
              {analyses.length > 0 ? (analyses.reduce((s: number, a: any) => s + (a.sentiment_score || 0), 0) / analyses.length).toFixed(0) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Avg Brand Safety</span>
            </div>
            <p className="text-2xl font-bold">
              {analyses.length > 0 ? (analyses.reduce((s: number, a: any) => s + (a.brand_safety_score || 0), 0) / analyses.length).toFixed(0) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Avg Quality</span>
            </div>
            <p className="text-2xl font-bold">
              {analyses.length > 0 ? (analyses.reduce((s: number, a: any) => s + (a.content_quality_score || 0), 0) / analyses.length).toFixed(0) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading analyses...</p>
      ) : analyses.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No content analyzed yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Analyze Content" to run AI analysis on creator content.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {analyses.map((a: any) => {
            const content = a.creator_content;
            const creator = content?.campaign_creators?.creators;
            const campaign = content?.campaign_creators?.campaigns;
            const findings = Array.isArray(a.key_findings) ? a.key_findings : [];
            return (
              <Card key={a.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelectedAnalysis(a)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">{creator?.name ?? "Unknown Creator"}</p>
                      <p className="text-xs text-muted-foreground">{campaign?.name ?? "Campaign"} · {content?.platform}</p>
                    </div>
                    <Badge variant={a.ad_compliance_score >= 70 ? "default" : "destructive"} className="text-[10px]">
                      {a.ad_compliance_score >= 70 ? "Compliant" : "Review"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <ScoreCard label="Brand Exposure" value={a.brand_exposure_score || 0} icon={Eye} color="text-blue-500" />
                    <ScoreCard label="Sentiment" value={a.sentiment_score || 0} icon={Smile} color="text-emerald-500" />
                    <ScoreCard label="Brand Safety" value={a.brand_safety_score || 0} icon={Shield} color="text-amber-500" />
                    <ScoreCard label="Content Quality" value={a.content_quality_score || 0} icon={Brain} color="text-violet-500" />
                  </div>
                  {findings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] text-muted-foreground mb-1">Key Findings:</p>
                      <ul className="space-y-0.5">
                        {findings.slice(0, 3).map((f: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Analyze Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Analyze Content with AI</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Content</Label>
              <Select value={selectedContentId} onValueChange={setSelectedContentId}>
                <SelectTrigger><SelectValue placeholder="Choose content to analyze" /></SelectTrigger>
                <SelectContent>
                  {contentList.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.campaign_creators?.creators?.name ?? "Creator"} — {c.platform} ({c.views?.toLocaleString() ?? 0} views)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content Description (optional)</Label>
              <Textarea
                value={contentDescription}
                onChange={(e) => setContentDescription(e.target.value)}
                placeholder="Describe the content: what product is shown, what the creator says, visual elements..."
                rows={4}
              />
            </div>
            <Button onClick={handleAnalyze} disabled={analyzing || !selectedContentId} className="w-full">
              {analyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Run AI Analysis</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {selectedAnalysis && (
        <Dialog open={!!selectedAnalysis} onOpenChange={(open) => !open && setSelectedAnalysis(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Analysis Details</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card><CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-blue-500">{selectedAnalysis.brand_exposure_score}</p>
                  <p className="text-[10px] text-muted-foreground">Brand Exposure</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-emerald-500">{selectedAnalysis.sentiment_score}</p>
                  <p className="text-[10px] text-muted-foreground">Sentiment</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-amber-500">{selectedAnalysis.ad_compliance_score}</p>
                  <p className="text-[10px] text-muted-foreground">Ad Compliance</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-violet-500">{selectedAnalysis.content_quality_score}</p>
                  <p className="text-[10px] text-muted-foreground">Content Quality</p>
                </CardContent></Card>
              </div>
              <Card><CardContent className="p-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm font-bold">{selectedAnalysis.product_visibility ? "✅" : "❌"}</p>
                    <p className="text-[10px] text-muted-foreground">Product Visible</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{selectedAnalysis.brand_logo_seconds?.toFixed(1)}s</p>
                    <p className="text-[10px] text-muted-foreground">Logo Time</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{selectedAnalysis.verbal_mentions}</p>
                    <p className="text-[10px] text-muted-foreground">Verbal Mentions</p>
                  </div>
                </div>
              </CardContent></Card>
              {Array.isArray(selectedAnalysis.key_findings) && selectedAnalysis.key_findings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2">All Findings</p>
                  <ul className="space-y-1">
                    {selectedAnalysis.key_findings.map((f: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default ContentAnalysis;
