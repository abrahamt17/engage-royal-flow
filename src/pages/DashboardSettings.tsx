import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useData";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DashboardSettings = () => {
  const { brandId } = useAuth();
  const { data: brand } = useBrand();
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [basePay, setBasePay] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [currency, setCurrency] = useState("");

  // Initialize from brand data
  const initialized = brand && !companyName && !industry;
  if (initialized) {
    setCompanyName(brand.company_name);
    setIndustry(brand.industry ?? "");
    setBasePay(String(brand.default_base_pay ?? 500));
    setMultiplier(String(brand.performance_multiplier ?? 2.5));
    setCurrency(brand.default_currency);
  }

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

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account and platform configuration">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Brand Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Company Name</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Industry</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
            <Button
              onClick={() => updateBrand.mutate({ company_name: companyName, industry })}
              disabled={updateBrand.isPending}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Payroll Configuration</CardTitle>
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
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">API Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["TikTok", "Instagram", "YouTube", "Stripe"].map((platform) => (
              <div key={platform} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-card-foreground">{platform}</span>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
