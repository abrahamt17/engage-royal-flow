import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Link2, Plus, DollarSign, Target, TrendingUp, ShoppingCart, Copy, Check } from "lucide-react";
import { useConversionTracking, useCreateTrackingCode } from "@/hooks/useMarketplaceData";
import { useCampaigns, useCreators } from "@/hooks/useData";
import { toast } from "sonner";
import { buildTrackingInsert, calculateConversionMetrics } from "@/lib/conversionTracking";

const ConversionTracking = () => {
  const { data: trackingCodes = [], isLoading } = useConversionTracking();
  const { data: campaigns = [] } = useCampaigns();
  const { data: creators = [] } = useCreators();
  const createTracking = useCreateTrackingCode();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState("utm");
  const [newCampaignId, setNewCampaignId] = useState("");
  const [newCreatorId, setNewCreatorId] = useState("");
  const [newCode, setNewCode] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const metrics = calculateConversionMetrics(trackingCodes as any[]);
  const rowMetrics = new Map(metrics.rows.map((row) => [row.id, row]));

  const handleCreate = async () => {
    try {
      const trackingInsert = buildTrackingInsert({
        campaignId: newCampaignId,
        creatorId: newCreatorId,
        trackingType: newType,
        trackingCode: newCode,
      });

      const duplicate = trackingCodes.some((tracking: any) =>
        tracking.campaign_id === trackingInsert.campaign_id &&
        tracking.tracking_code.trim().toLowerCase() === trackingInsert.tracking_code.toLowerCase()
      );

      if (duplicate) {
        throw new Error("That tracking code already exists for this campaign.");
      }

      await createTracking.mutateAsync(trackingInsert);
      toast.success("Tracking code created");
      setDialogOpen(false);
      setNewType("utm");
      setNewCampaignId("");
      setNewCreatorId("");
      setNewCode("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tracking code creation failed.";
      toast.error(message);
    }
  };

  const copyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Could not copy tracking code.");
    }
  };

  const typeStyles: Record<string, string> = {
    utm: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    promo: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    affiliate: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    pixel: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  };

  return (
    <DashboardLayout
      title="Conversion Tracking"
      subtitle="Track UTM links, promo codes, and revenue attribution"
      action={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={campaigns.length === 0}>
              <Plus className="h-4 w-4 mr-2" /> New Tracking Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Tracking Code</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utm">UTM Link</SelectItem>
                    <SelectItem value="promo">Promo Code</SelectItem>
                    <SelectItem value="affiliate">Affiliate Code</SelectItem>
                    <SelectItem value="pixel">Pixel Tracking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Campaign</Label>
                <Select value={newCampaignId} onValueChange={setNewCampaignId}>
                  <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Creator (optional)</Label>
                <Select value={newCreatorId} onValueChange={setNewCreatorId}>
                  <SelectTrigger><SelectValue placeholder="Select creator" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific creator</SelectItem>
                    {creators.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tracking Code / URL</Label>
                <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder={newType === "utm" ? "https://example.com?utm_source=..." : "PROMO2024"} />
              </div>
              <Button onClick={handleCreate} disabled={createTracking.isPending || !newCampaignId || !newCode.trim()} className="w-full">
                {createTracking.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Total Clicks</span>
            </div>
            <p className="text-2xl font-bold">{metrics.totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Conversions</span>
            </div>
            <p className="text-2xl font-bold">{metrics.totalConversions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Avg CPA</span>
            </div>
            <p className="text-2xl font-bold">{metrics.avgCPA === null ? "—" : `$${metrics.avgCPA.toFixed(2)}`}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Active Tracking Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : trackingCodes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No tracking codes yet. Create one to start tracking conversions.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">CPA</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackingCodes.map((t: any) => {
                  const metric = rowMetrics.get(t.id);
                  const cpaText = metric?.cpa == null ? "—" : `$${metric.cpa.toFixed(2)}`;
                  const roasText = metric?.roas == null ? "—" : `${metric.roas.toFixed(1)}x`;
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Badge variant="outline" className={typeStyles[t.tracking_type] || ""}>
                          {t.tracking_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded max-w-[200px] truncate">{t.tracking_code}</code>
                          <button type="button" onClick={() => copyCode(t.id, t.tracking_code)} className="text-muted-foreground hover:text-foreground" title="Copy tracking code">
                            {copiedId === t.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{t.campaigns?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs">{t.creators?.name ?? "—"}</TableCell>
                      <TableCell className="text-right font-medium">{(t.clicks ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{(t.conversions ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">${(t.revenue ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{cpaText}</TableCell>
                      <TableCell className="text-right font-medium">{roasText}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ConversionTracking;
