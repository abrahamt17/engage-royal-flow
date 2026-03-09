import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Plus, FileText, CheckCircle, Clock, AlertTriangle, Scale } from "lucide-react";
import { useComplianceRecords, useCreateComplianceRecord } from "@/hooks/usePlatformData";
import { useCreators } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const complianceTypes = [
  { value: "1099-NEC", label: "US 1099-NEC", jurisdiction: "US" },
  { value: "1099-MISC", label: "US 1099-MISC", jurisdiction: "US" },
  { value: "W-8BEN", label: "US W-8BEN (Foreign)", jurisdiction: "US" },
  { value: "VAT", label: "EU VAT", jurisdiction: "EU" },
  { value: "DAC7", label: "EU DAC7 Reporting", jurisdiction: "EU" },
  { value: "IR35", label: "UK IR35", jurisdiction: "UK" },
  { value: "GST", label: "AU/NZ GST", jurisdiction: "AU" },
  { value: "WHT", label: "Withholding Tax", jurisdiction: "Global" },
];

const GlobalCompliance = () => {
  const { brandId } = useAuth();
  const { data: records = [], isLoading } = useComplianceRecords();
  const { data: creators = [] } = useCreators();
  const createRecord = useCreateComplianceRecord();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [creatorId, setCreatorId] = useState("");
  const [compType, setCompType] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = async () => {
    if (!creatorId || !compType || !brandId) {
      toast.error("Select a creator and compliance type");
      return;
    }
    const ct = complianceTypes.find((t) => t.value === compType);
    try {
      await createRecord.mutateAsync({
        creator_id: creatorId,
        brand_id: brandId,
        compliance_type: compType,
        jurisdiction: ct?.jurisdiction || "US",
        tax_year: new Date().getFullYear(),
        amount: parseFloat(amount) || 0,
        due_date: dueDate || undefined,
        notes: notes || undefined,
      });
      toast.success("Compliance record created");
      setDialogOpen(false);
      setNotes("");
      setAmount("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    filed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    overdue: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const pendingCount = records.filter((r: any) => r.status === "pending").length;
  const filedCount = records.filter((r: any) => r.status === "filed").length;
  const totalAmount = records.reduce((s: number, r: any) => s + (r.amount || 0), 0);

  return (
    <DashboardLayout
      title="Global Compliance"
      subtitle="Tax and regulatory compliance across jurisdictions"
      action={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Record</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Compliance Record</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Creator</Label>
                <Select value={creatorId} onValueChange={setCreatorId}>
                  <SelectTrigger><SelectValue placeholder="Select creator" /></SelectTrigger>
                  <SelectContent>{creators.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.handle})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Compliance Type</Label>
                <Select value={compType} onValueChange={setCompType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {complianceTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label} ({t.jurisdiction})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Amount ($)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" /></div>
                <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} /></div>
              <Button onClick={handleCreate} disabled={createRecord.isPending} className="w-full">
                {createRecord.isPending ? "Creating..." : "Create Record"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Scale className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Total Records</span></div>
          <p className="text-2xl font-bold">{records.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-amber-500" /><span className="text-xs text-muted-foreground">Pending</span></div>
          <p className="text-2xl font-bold">{pendingCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-emerald-500" /><span className="text-xs text-muted-foreground">Filed</span></div>
          <p className="text-2xl font-bold">{filedCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Globe className="h-4 w-4 text-violet-500" /><span className="text-xs text-muted-foreground">Total Amount</span></div>
          <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
        </CardContent></Card>
      </div>

      {/* Jurisdiction Overview */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Supported Jurisdictions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-xs font-semibold">🇺🇸 United States</p>
              <p className="text-[10px] text-muted-foreground">1099-NEC, 1099-MISC, W-8BEN</p>
            </div>
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-xs font-semibold">🇪🇺 European Union</p>
              <p className="text-[10px] text-muted-foreground">VAT, DAC7 Reporting</p>
            </div>
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-xs font-semibold">🇬🇧 United Kingdom</p>
              <p className="text-[10px] text-muted-foreground">IR35 Compliance</p>
            </div>
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-xs font-semibold">🌍 Global</p>
              <p className="text-[10px] text-muted-foreground">Withholding Tax, GST</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Compliance Records</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No compliance records yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Jurisdiction</TableHead>
                  <TableHead>Tax Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs font-medium">{r.creators?.name ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{r.compliance_type}</Badge></TableCell>
                    <TableCell className="text-xs">{r.jurisdiction}</TableCell>
                    <TableCell className="text-xs">{r.tax_year}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${statusStyles[r.status] || ""}`}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right text-xs font-medium">${(r.amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.due_date || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default GlobalCompliance;
