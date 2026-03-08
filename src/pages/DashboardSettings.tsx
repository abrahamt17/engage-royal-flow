import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DashboardSettings = () => {
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
              <Input defaultValue="Brand Co." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Industry</Label>
              <Input defaultValue="Consumer Electronics" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Payroll Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Default Base Pay</Label>
                <Input defaultValue="$500" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Performance Multiplier</Label>
                <Input defaultValue="2.5x" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Default Currency</Label>
                <Input defaultValue="USD" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Payout Schedule</Label>
                <Input defaultValue="Bi-weekly" />
              </div>
            </div>
            <Button>Update Payroll Settings</Button>
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
