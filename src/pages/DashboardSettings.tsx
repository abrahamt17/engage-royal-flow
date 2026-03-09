import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useData";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Bell, CreditCard, Building2, Trash2, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DashboardSettings = () => {
  const { brandId, user, signOut } = useAuth();
  const { data: brand } = useBrand();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [basePay, setBasePay] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [currency, setCurrency] = useState("");
  
  // Notification preferences (client-side only for now)
  const [emailPayroll, setEmailPayroll] = useState(true);
  const [emailCampaign, setEmailCampaign] = useState(true);
  const [emailFraud, setEmailFraud] = useState(true);
  const [emailWeekly, setEmailWeekly] = useState(false);

  useEffect(() => {
    if (brand) {
      setCompanyName(brand.company_name);
      setIndustry(brand.industry ?? "");
      setBasePay(String(brand.default_base_pay ?? 500));
      setMultiplier(String(brand.performance_multiplier ?? 2.5));
      setCurrency(brand.default_currency);
    }
  }, [brand]);

  const updateBrand = useMutation({
    mutationFn: async (fields: Record<string, any>) => {
      if (!brandId) throw new Error("No brand");
      const { error } = await supabase
        .from("brands")
        .update(fields)
        .eq("id", brandId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand"] });
      toast.success("Settings saved!");
    },
    onError: (e) => toast.error(e.message),
  });

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent!");
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account and platform configuration">
      <div className="max-w-2xl space-y-6">
        {/* Brand Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Brand Profile</CardTitle>
            </div>
            <CardDescription className="text-xs">Update your company information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Company Name</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Industry</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Fashion, Tech, Gaming" />
            </div>
            <Button
              onClick={() => updateBrand.mutate({ company_name: companyName, industry })}
              disabled={updateBrand.isPending}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Account Security</CardTitle>
            </div>
            <CardDescription className="text-xs">Manage your account access and security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-card-foreground">Email</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">Verified</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-card-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Send a password reset link to your email</p>
              </div>
              <Button variant="outline" size="sm" onClick={handlePasswordReset}>
                <KeyRound className="h-4 w-4 mr-1" />
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Payroll Configuration</CardTitle>
            </div>
            <CardDescription className="text-xs">Default payroll settings for new campaigns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Default Base Pay ($)</Label>
                <Input type="number" value={basePay} onChange={(e) => setBasePay(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Performance Multiplier</Label>
                <Input type="number" step="0.1" value={multiplier} onChange={(e) => setMultiplier(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() =>
                updateBrand.mutate({
                  default_base_pay: parseFloat(basePay) || 500,
                  performance_multiplier: parseFloat(multiplier) || 2.5,
                  default_currency: currency,
                })
              }
              disabled={updateBrand.isPending}
            >
              Update Payroll Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
            </div>
            <CardDescription className="text-xs">Choose what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-card-foreground">Payroll Updates</p>
                <p className="text-xs text-muted-foreground">Get notified when payments are processed</p>
              </div>
              <Switch checked={emailPayroll} onCheckedChange={setEmailPayroll} />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-card-foreground">Campaign Milestones</p>
                <p className="text-xs text-muted-foreground">Alerts when campaigns hit budget goals</p>
              </div>
              <Switch checked={emailCampaign} onCheckedChange={setEmailCampaign} />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-card-foreground">Fraud Alerts</p>
                <p className="text-xs text-muted-foreground">Immediate alerts for high-risk creators</p>
              </div>
              <Switch checked={emailFraud} onCheckedChange={setEmailFraud} />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-card-foreground">Weekly Digest</p>
                <p className="text-xs text-muted-foreground">Summary of campaign performance each week</p>
              </div>
              <Switch checked={emailWeekly} onCheckedChange={setEmailWeekly} />
            </div>
          </CardContent>
        </Card>

        {/* API Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">API Integrations</CardTitle>
            <CardDescription className="text-xs">Connect your social media and payment accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "TikTok", status: "available" },
              { name: "Instagram", status: "available" },
              { name: "YouTube", status: "available" },
              { name: "Stripe", status: "available" },
            ].map((platform) => (
              <div key={platform.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-card-foreground">{platform.name}</span>
                  <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                </div>
                <Button variant="outline" size="sm" disabled>Connect</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              <CardTitle className="text-sm font-semibold text-destructive">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-card-foreground">Sign Out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
};

export default DashboardSettings;
