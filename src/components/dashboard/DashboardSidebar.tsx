import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useData";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  Shield,
  Zap,
  LogOut,
  Upload,
  Brain,
  UserCheck,
  UserPlus,
  BookOpen,
  Store,
  Target,
  Sparkles,
  Activity,
  TrendingUp,
  Bot,
  FileText,
  Code,
  Network,
  Scale,
  Award,
  Database,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/" },
  { icon: Megaphone, label: "Campaigns", path: "/campaigns" },
  { icon: Users, label: "Creators", path: "/creators" },
  { icon: Store, label: "Marketplace", path: "/marketplace" },
  { icon: Activity, label: "Real-Time", path: "/realtime" },
  { icon: Target, label: "Conversions", path: "/conversions" },
  { icon: Sparkles, label: "Content AI", path: "/content-analysis" },
  { icon: TrendingUp, label: "Forecasting", path: "/forecasting" },
  { icon: Bot, label: "Automation", path: "/automation" },
  { icon: CreditCard, label: "Payroll", path: "/payroll" },
  { icon: Zap, label: "Smart Payroll", path: "/smart-payroll" },
  { icon: FileText, label: "Contracts", path: "/contracts" },
  { icon: Shield, label: "Fraud Detection", path: "/fraud" },
  { icon: Network, label: "Influence Graph", path: "/influence-graph" },
  { icon: Scale, label: "Compliance", path: "/compliance" },
  { icon: Award, label: "Loyalty", path: "/loyalty" },
  { icon: Database, label: "Benchmarks", path: "/benchmarks" },
  { icon: Code, label: "API", path: "/api-docs" },
  { icon: Brain, label: "AI Insights", path: "/ai-insights" },
  { icon: Upload, label: "Submit Content", path: "/submit-content" },
  { icon: UserPlus, label: "Onboarding", path: "/creator-onboarding" },
  { icon: UserCheck, label: "Creator View", path: "/creator-dashboard" },
  { icon: BookOpen, label: "Documentation", path: "/docs" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { data: brand } = useBrand();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 sidebar-gradient border-r border-sidebar-border flex-col">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
          CreatorPay
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-foreground">
            {brand?.company_name?.[0]?.toUpperCase() ?? "B"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {brand?.company_name ?? "Loading..."}
            </p>
            <p className="text-xs text-sidebar-muted truncate">Pro Plan</p>
          </div>
          <button
            onClick={signOut}
            className="text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;