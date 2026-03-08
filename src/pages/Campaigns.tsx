import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CampaignTable from "@/components/dashboard/CampaignTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Campaigns = () => {
  return (
    <DashboardLayout title="Campaigns" subtitle="Create and manage your creator campaigns">
      <div className="flex justify-end mb-6">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>
      <CampaignTable />
    </DashboardLayout>
  );
};

export default Campaigns;
