import { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { ThemeToggle } from "./ThemeToggle";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const DashboardLayout = ({ children, title, subtitle, action }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="md:ml-64">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-4 md:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <MobileSidebar />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-foreground tracking-tight truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <ThemeToggle />
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
