import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import CampaignTable from "@/components/dashboard/CampaignTable";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import TopCreators from "@/components/dashboard/TopCreators";
import AudienceMatchChart from "@/components/dashboard/AudienceMatchChart";
import { DollarSign, Users, Megaphone, TrendingUp } from "lucide-react";
import { useCampaigns, useCreators } from "@/hooks/useData";

const Index = () => {
  const { data: campaigns = [] } = useCampaigns();
  const { data: creators = [] } = useCreators();

  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent ?? 0), 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget ?? 0), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  return (
    <DashboardLayout title="Overview" subtitle="Monitor your creator marketing performance">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Spend"
          value={`$${totalSpent.toLocaleString()}`}
          change={`$${totalBudget.toLocaleString()} total budget`}
          changeType="neutral"
          icon={DollarSign}
        />
        <StatCard
          title="Creators Available"
          value={creators.length.toString()}
          change="In marketplace"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Active Campaigns"
          value={activeCampaigns.toString()}
          change={`${campaigns.length} total`}
          changeType="neutral"
          icon={Megaphone}
        />
        <StatCard
          title="Avg. Engagement"
          value={
            creators.length
              ? `${(creators.reduce((s, c) => s + (c.avg_engagement_rate ?? 0), 0) / creators.length).toFixed(1)}%`
              : "—"
          }
          change="Across all creators"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceChart />
        <AudienceMatchChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground mb-3">Recent Campaigns</h2>
          <CampaignTable />
        </div>
        <TopCreators />
      </div>
    </DashboardLayout>
  );
};

export default Index;
