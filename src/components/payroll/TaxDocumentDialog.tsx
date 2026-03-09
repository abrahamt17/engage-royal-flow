import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle } from "lucide-react";
import { useTaxDocuments } from "@/hooks/usePaymentData";

interface TaxDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaxDocumentDialog = ({ open, onOpenChange }: TaxDocumentDialogProps) => {
  const { data: taxDocs = [] } = useTaxDocuments();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Tax Documentation
          </DialogTitle>
          <DialogDescription>
            Creator tax forms and compliance status
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents ({taxDocs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border bg-muted/20 text-center">
                <p className="text-2xl font-bold text-card-foreground">
                  {taxDocs.filter((d: any) => d.verified_at).length}
                </p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-muted/20 text-center">
                <p className="text-2xl font-bold text-warning">
                  {taxDocs.filter((d: any) => !d.verified_at).length}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <p className="text-xs font-medium text-card-foreground mb-1">Required Forms</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>W-9</strong> — US-based creators (SSN/EIN required)</li>
                <li>• <strong>W-8BEN</strong> — International individuals</li>
                <li>• <strong>W-8BEN-E</strong> — International entities</li>
                <li>• <strong>1099</strong> — Auto-generated for US creators earning $600+</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-2 mt-4">
            {taxDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tax documents on file yet
              </p>
            ) : (
              taxDocs.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{doc.legal_name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.document_type.toUpperCase()} · {doc.tax_year ?? "N/A"}
                      {doc.country && ` · ${doc.country}`}
                    </p>
                  </div>
                  {doc.verified_at ? (
                    <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                      <CheckCircle className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      Pending
                    </Badge>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TaxDocumentDialog;