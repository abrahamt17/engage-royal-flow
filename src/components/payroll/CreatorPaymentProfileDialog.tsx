import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Globe, Building, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatorPaymentProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
}

const CreatorPaymentProfileDialog = ({
  open, onOpenChange, creatorId, creatorName,
}: CreatorPaymentProfileDialogProps) => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["creator_payment_profile", creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_payment_profiles")
        .select("*")
        .eq("creator_id", creatorId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: open && !!creatorId,
  });

  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [wiseEmail, setWiseEmail] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankRoutingNumber, setBankRoutingNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCountry, setBankCountry] = useState("US");
  const [preferredCurrency, setPreferredCurrency] = useState("USD");

  useEffect(() => {
    if (profile) {
      setPaymentMethod(profile.payment_method);
      setPaypalEmail(profile.paypal_email ?? "");
      setWiseEmail(profile.wise_email ?? "");
      setBankAccountNumber(profile.bank_account_number ?? "");
      setBankRoutingNumber(profile.bank_routing_number ?? "");
      setBankName(profile.bank_name ?? "");
      setBankCountry(profile.bank_country ?? "US");
      setPreferredCurrency(profile.preferred_currency);
    }
  }, [profile]);

  const upsertProfile = useMutation({
    mutationFn: async () => {
      const payload = {
        creator_id: creatorId,
        payment_method: paymentMethod,
        paypal_email: paypalEmail || null,
        wise_email: wiseEmail || null,
        bank_account_number: bankAccountNumber || null,
        bank_routing_number: bankRoutingNumber || null,
        bank_name: bankName || null,
        bank_country: bankCountry || null,
        preferred_currency: preferredCurrency,
      };

      if (profile?.id) {
        const { error } = await supabase
          .from("creator_payment_profiles")
          .update(payload)
          .eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("creator_payment_profiles")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator_payment_profile", creatorId] });
      toast.success("Payment profile saved");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Payment Profile
          </DialogTitle>
          <DialogDescription>{creatorName}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Globe className="h-3 w-3" /> Preferred Currency
              </Label>
              <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {paymentMethod === "paypal" && (
              <div className="space-y-2">
                <Label className="text-xs">PayPal Email</Label>
                <Input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="creator@email.com" type="email" />
              </div>
            )}

            {paymentMethod === "wise" && (
              <div className="space-y-2">
                <Label className="text-xs">Wise Email</Label>
                <Input value={wiseEmail} onChange={(e) => setWiseEmail(e.target.value)} placeholder="creator@email.com" type="email" />
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-card-foreground">Bank Details</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Bank Name</Label>
                  <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Chase Bank" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Account Number</Label>
                    <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="••••1234" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Routing Number</Label>
                    <Input value={bankRoutingNumber} onChange={(e) => setBankRoutingNumber(e.target.value)} placeholder="021000021" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Bank Country</Label>
                  <Select value={bankCountry} onValueChange={setBankCountry}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {paymentMethod === "stripe" && (
              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Stripe Connect onboarding will be sent to the creator's email when processing payouts.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => upsertProfile.mutate()} disabled={upsertProfile.isPending}>
            {upsertProfile.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorPaymentProfileDialog;