import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import Creators from "./pages/Creators";
import Analytics from "./pages/Analytics";
import Payroll from "./pages/Payroll";
import FraudDetection from "./pages/FraudDetection";
import DashboardSettings from "./pages/DashboardSettings";
import SubmitContent from "./pages/SubmitContent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
            <Route path="/creators" element={<ProtectedRoute><Creators /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
            <Route path="/fraud" element={<ProtectedRoute><FraudDetection /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
            <Route path="/submit-content" element={<ProtectedRoute><SubmitContent /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
