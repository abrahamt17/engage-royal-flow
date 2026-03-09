import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, Eye, DollarSign, Bell, BellOff, Activity, AlertTriangle } from "lucide-react";
import { usePerformanceAlerts, useMarkAlertRead } from "@/hooks/useAdvancedData";
import { useCampaigns, useCreatorContent, usePayroll } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";

const RealTimeMonitor = () => {
  const { data: alerts = [], isLoading: alertsLoading } = usePerformanceAlerts();
  const { data: campaigns = [] } = useCampaigns();
  const { data: content = [] } = useCreatorContent();
  const { data: payroll = [] } = usePayroll();
  const markRead = useMarkAlertRead();
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);

  // Realtime subscription for alerts
  useEffect(() => {
    const channel = supabase
      .channel("realtime-alerts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "performance_alerts" }, (payload) => {
        setLiveAlerts((prev) => [payload.new, ...prev].slice(0, 20));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const allAlerts = [...liveAlerts, ...alerts].filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i);
  const unreadCount = allAlerts.filter((a) => !a.is_read).length;

  // Live metrics
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalViews = content.reduce((s, c) => s + (c.views || 0), 0);
  const totalSpent = payroll.reduce((s, p) => s + (p.total_payment || 0), 0);
  const avgEngagement = content.length > 0
    ? content.reduce((s, c) => s + ((c.likes || 0) + (c.comments || 0) + (c.shares || 0)) / Math.max(c.views || 1, 1) * 100, 0) / content.length
    : 0;

  const alertStyles: Record<string, { icon: any; color: string; bg: string }> = {
    viral: { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
    trending: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    warning: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    info: { icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
  };

  return (
    <DashboardLayout title="Real-Time Monitor" subtitle="Live campaign performance and alerts">
      {/* Live Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Active Campaigns</span>
            </div>
            <p className="text-2xl font-bold">{activeCampaigns}</p>
            <div className="h-1 bg-emerald-500/20 rounded-full mt-2">
              <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Total Views</span>
            </div>
            <p className="text-2xl font-bold">{totalViews >= 1000000 ? `${(totalViews / 1000000).toFixed(1)}M` : totalViews >= 1000 ? `${(totalViews / 1000).toFixed(0)}K` : totalViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Avg Engagement</span>
            </div>
            <p className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Est. Payouts</span>
            </div>
            <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Performance Alerts
              {unreadCount > 0 && <Badge variant="destructive" className="text-[10px] h-5">{unreadCount} new</Badge>}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <p className="text-sm text-muted-foreground">Loading alerts...</p>
          ) : allAlerts.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No alerts yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Alerts appear when content hits performance thresholds.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allAlerts.map((alert: any) => {
                const style = alertStyles[alert.alert_type] || alertStyles.info;
                const Icon = style.icon;
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${!alert.is_read ? "bg-accent/30 border-primary/20" : "border-border"}`}
                  >
                    <div className={`p-1.5 rounded-lg ${style.bg}`}>
                      <Icon className={`h-4 w-4 ${style.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium">{alert.title}</p>
                        {!alert.is_read && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      {alert.message && <p className="text-xs text-muted-foreground">{alert.message}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        {alert.campaigns?.name && <span className="text-[10px] text-muted-foreground">📢 {alert.campaigns.name}</span>}
                        {alert.creators?.name && <span className="text-[10px] text-muted-foreground">👤 {alert.creators.name}</span>}
                        {alert.metric_value != null && (
                          <Badge variant="outline" className="text-[10px] h-4">
                            {alert.metric_name}: {alert.metric_value.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!alert.is_read && (
                      <Button variant="ghost" size="sm" className="text-xs shrink-0" onClick={() => markRead.mutate(alert.id)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default RealTimeMonitor;
