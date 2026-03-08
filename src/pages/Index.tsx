import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import CampaignTable from "@/components/dashboard/CampaignTable";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import TopCreators from "@/components/dashboard/TopCreators";
import AudienceMatchChart from "@/components/dashboard/AudienceMatchChart";
import { DollarSign, Users, Megaphone, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout title="Overview" subtitle="Monitor your creator marketing performance">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Spend"
          value="$230,040"
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Active Creators"
          value="1,284"
          change="+48 this week"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Active Campaigns"
          value="24"
          change="3 ending soon"
          changeType="neutral"
          icon={Megaphone}
        />
        <StatCard
          title="Avg. ROI"
          value="3.2x"
          change="+0.4x vs last quarter"
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
