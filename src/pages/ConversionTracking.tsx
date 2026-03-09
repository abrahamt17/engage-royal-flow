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

  const totalClicks = trackingCodes.reduce((s, t) => s + (t.clicks || 0), 0);
  const totalConversions = trackingCodes.reduce((s, t) => s + (t.conversions || 0), 0);
  const totalRevenue = trackingCodes.reduce((s, t) => s + (t.revenue || 0), 0);
  const avgCPA = totalConversions > 0 ? totalRevenue / totalConversions : 0;

  const handleCreate = async () => {
    if (!newCampaignId || !newCode) {
      toast.error("Campaign and tracking code are required");
      return;
    }
    try {
      await createTracking.mutateAsync({
        campaign_id: newCampaignId,
        creator_id: newCreatorId || undefined,
        tracking_type: newType,
        tracking_code: newCode,
      });
      toast.success("Tracking code created");
      setDialogOpen(false);
      setNewCode("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Tracking Code</Button>
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
              <Button onClick={handleCreate} disabled={createTracking.isPending} className="w-full">
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
            <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Conversions</span>
            </div>
            <p className="text-2xl font-bold">{totalConversions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Avg CPA</span>
            </div>
            <p className="text-2xl font-bold">${avgCPA.toFixed(2)}</p>
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
                  <TableHead className="text-right">ROAS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackingCodes.map((t: any) => {
                  const roas = t.clicks > 0 ? (t.revenue / (t.clicks * 0.5)).toFixed(1) : "—";
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
                          <button onClick={() => copyCode(t.id, t.tracking_code)} className="text-muted-foreground hover:text-foreground">
                            {copiedId === t.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{t.campaigns?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs">{t.creators?.name ?? "—"}</TableCell>
                      <TableCell className="text-right font-medium">{t.clicks?.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{t.conversions?.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">${t.revenue?.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{roas}x</TableCell>
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
