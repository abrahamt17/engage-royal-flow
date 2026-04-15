import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CreditCard, Globe, Send } from "lucide-react";

interface BatchPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  totalAmount: number;
  onCreateBatch: (opts: { paymentMethod: string; scheduledFor?: string }) => void;
  isPending: boolean;
}

const BatchPayoutDialog = ({
  open,
  onOpenChange,
  selectedCount,
  totalAmount,
  onCreateBatch,
  isPending,
}: BatchPayoutDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            Create Payout Batch
          </DialogTitle>
          <DialogDescription>
            Process {selectedCount} payment{selectedCount > 1 ? "s" : ""} totaling ${totalAmount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-card-foreground">{selectedCount} creators</p>
              <p className="text-xs text-muted-foreground">Selected for payout</p>
            </div>
            <Badge variant="outline" className="text-lg font-semibold">${totalAmount.toLocaleString()}</Badge>
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> Payment Method
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="wise">Wise</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Schedule
            </Label>
            <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="now">Process Now</SelectItem>
                <SelectItem value="scheduled">Schedule for Later</SelectItem>
              </SelectContent>
            </Select>
            {scheduleType === "scheduled" && (
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs font-medium text-card-foreground">Multi-Currency</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Payments use each creator's preferred currency. PayPal can be automated when credentials are configured; Wise, bank transfer, and Stripe batches are prepared for manual payout handoff.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() =>
              onCreateBatch({
                paymentMethod,
                scheduledFor: scheduleType === "scheduled" ? scheduledDate : undefined,
              })
            }
            disabled={isPending || (scheduleType === "scheduled" && !scheduledDate)}
          >
            {isPending ? "Creating..." : scheduleType === "scheduled" ? "Schedule Batch" : "Create & Process"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchPayoutDialog;
