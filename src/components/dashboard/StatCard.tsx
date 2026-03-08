import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

const StatCard = ({ title, value, change, changeType = "neutral", icon: Icon }: StatCardProps) => {
  const changeColor = changeType === "positive"
    ? "text-success"
    : changeType === "negative"
    ? "text-destructive"
    : "text-muted-foreground";

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold text-card-foreground tracking-tight">{value}</p>
            {change && (
              <p className={`text-xs font-medium ${changeColor}`}>{change}</p>
            )}
          </div>
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="h-4 w-4 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
