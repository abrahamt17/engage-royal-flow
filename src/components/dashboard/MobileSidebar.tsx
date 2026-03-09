import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useData";
import {
  LayoutDashboard, Megaphone, Users, BarChart3, CreditCard, Settings, Shield, Zap,
  LogOut, Upload, Menu, Brain, UserCheck, UserPlus, BookOpen, Store, Target, Sparkles,
  Activity, TrendingUp, Bot, FileText, Code, Network, Scale, Award, Database,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  { icon: BookOpen, label: "Documentation", path: "/docs" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const MobileSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { data: brand } = useBrand();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">CreatorPay</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold">
              {brand?.company_name?.[0]?.toUpperCase() ?? "B"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {brand?.company_name ?? "Loading..."}
              </p>
              <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
            </div>
            <button
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
