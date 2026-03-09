import StatCard from "@/components/dashboard/StatCard";
import { Shield, AlertTriangle, Ban, CheckCircle } from "lucide-react";

interface FraudStatCardsProps {
  total: number;
  flagged: number;
  highRisk: number;
  clean: number;
}

const FraudStatCards = ({ total, flagged, highRisk, clean }: FraudStatCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <StatCard title="Total Creators" value={total.toString()} change="In system" changeType="neutral" icon={Shield} />
    <StatCard
      title="Flagged"
      value={flagged.toString()}
      change={`${((flagged / Math.max(total, 1)) * 100).toFixed(1)}% flag rate`}
      changeType="negative"
      icon={AlertTriangle}
    />
    <StatCard title="High Risk" value={highRisk.toString()} change="Score ≥ 50" changeType="negative" icon={Ban} />
    <StatCard title="Verified Clean" value={clean.toString()} change="Score < 15" changeType="positive" icon={CheckCircle} />
  </div>
);

export default FraudStatCards;
