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
import { FileText, Plus, CheckCircle, Clock, Pen, AlertTriangle } from "lucide-react";
import { useContracts, useCreateContract, useSignContract } from "@/hooks/useAdvancedData";
import { useCampaigns, useCreators } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ContractManager = () => {
  const { brandId } = useAuth();
  const { data: contracts = [], isLoading } = useContracts();
  const { data: campaigns = [] } = useCampaigns();
  const { data: creators = [] } = useCreators();
  const createContract = useCreateContract();
  const signContract = useSignContract();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [terms, setTerms] = useState("");
  const [basePay, setBasePay] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleCreate = async () => {
    if (!campaignId || !creatorId || !brandId) {
      toast.error("Select a campaign and creator");
      return;
    }
    try {
      const contractNum = `CP-${Date.now().toString(36).toUpperCase()}`;
      const deliverablesList = deliverables.split("\n").filter(Boolean).map((d, i) => ({
        id: i + 1,
        description: d.trim(),
        status: "pending",
      }));
      await createContract.mutateAsync({
        campaign_id: campaignId,
        creator_id: creatorId,
        brand_id: brandId,
        contract_number: contractNum,
        deliverables: deliverablesList,
        terms: terms || "Standard CreatorPay terms apply.",
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        base_pay: parseFloat(basePay) || 0,
        payment_milestones: [
          { milestone: "Contract signed", percentage: 25, status: "pending" },
          { milestone: "Content delivered", percentage: 50, status: "pending" },
          { milestone: "Performance review", percentage: 25, status: "pending" },
        ],
      });
      toast.success("Contract created!");
      setDialogOpen(false);
      setTerms("");
      setDeliverables("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSign = async (contractId: string) => {
    try {
      await signContract.mutateAsync({
        contractId,
        party: "brand",
        signature: `Brand-${brandId}-${Date.now()}`,
      });
      toast.success("Contract signed by brand!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const statusStyles: Record<string, { color: string; icon: any }> = {
    draft: { color: "bg-muted text-muted-foreground", icon: FileText },
    pending_creator: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
    active: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle },
    completed: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle },
    disputed: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  };

  return (
    <DashboardLayout
      title="Contract Manager"
      subtitle="Auto-generated contracts with deliverables and milestones"
      action={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Contract</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Contract</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <Label>Campaign</Label>
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                  <SelectContent>{campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Creator</Label>
                <Select value={creatorId} onValueChange={setCreatorId}>
                  <SelectTrigger><SelectValue placeholder="Select creator" /></SelectTrigger>
                  <SelectContent>{creators.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.handle})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div><Label>End Date</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
              </div>
              <div><Label>Base Pay ($)</Label><Input type="number" value={basePay} onChange={(e) => setBasePay(e.target.value)} placeholder="500" /></div>
              <div>
                <Label>Deliverables (one per line)</Label>
                <Textarea value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder={"1 TikTok video (60s)\n2 Instagram stories\n1 YouTube mention"} rows={4} />
              </div>
              <div>
                <Label>Terms</Label>
                <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Additional contract terms..." rows={3} />
              </div>
              <Button onClick={handleCreate} disabled={createContract.isPending} className="w-full">
                {createContract.isPending ? "Creating..." : "Generate Contract"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Total Contracts</span></div>
          <p className="text-2xl font-bold">{contracts.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-emerald-500" /><span className="text-xs text-muted-foreground">Active</span></div>
          <p className="text-2xl font-bold">{contracts.filter((c: any) => c.status === "active").length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-amber-500" /><span className="text-xs text-muted-foreground">Pending</span></div>
          <p className="text-2xl font-bold">{contracts.filter((c: any) => c.status === "draft" || c.status === "pending_creator").length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-xs text-muted-foreground">Disputed</span></div>
          <p className="text-2xl font-bold">{contracts.filter((c: any) => c.status === "disputed").length}</p>
        </CardContent></Card>
      </div>

      {/* Contract List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading contracts...</p>
      ) : contracts.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No contracts yet. Create one to get started.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract: any) => {
            const style = statusStyles[contract.status] || statusStyles.draft;
            const Icon = style.icon;
            const delivs = Array.isArray(contract.deliverables) ? contract.deliverables : [];
            const milestones = Array.isArray(contract.payment_milestones) ? contract.payment_milestones : [];
            return (
              <Card key={contract.id} className="animate-fade-in">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold font-mono">{contract.contract_number}</p>
                        <Badge variant="outline" className={style.color}><Icon className="h-3 w-3 mr-1" />{contract.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {contract.creators?.name} → {contract.campaigns?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${(contract.base_pay || 0).toLocaleString()}</p>
                      {contract.status === "draft" && (
                        <Button variant="outline" size="sm" className="text-xs mt-1" onClick={() => handleSign(contract.id)}>
                          <Pen className="h-3 w-3 mr-1" /> Sign
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Deliverables */}
                  {delivs.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">DELIVERABLES</p>
                      <div className="space-y-1">
                        {delivs.map((d: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <CheckCircle className={`h-3 w-3 ${d.status === "completed" ? "text-emerald-500" : "text-muted"}`} />
                            <span className={d.status === "completed" ? "line-through text-muted-foreground" : ""}>{d.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestones */}
                  {milestones.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">PAYMENT MILESTONES</p>
                      <div className="flex gap-2">
                        {milestones.map((m: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {m.milestone} ({m.percentage}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                    {contract.start_date && <span className="text-[10px] text-muted-foreground">📅 Start: {contract.start_date}</span>}
                    {contract.end_date && <span className="text-[10px] text-muted-foreground">📅 End: {contract.end_date}</span>}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {contract.signed_by_brand ? "✅ Brand signed" : "⏳ Brand unsigned"}
                      {" · "}
                      {contract.signed_by_creator ? "✅ Creator signed" : "⏳ Creator unsigned"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ContractManager;
