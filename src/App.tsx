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
import CreatorMarketplace from "./pages/CreatorMarketplace";
import ConversionTracking from "./pages/ConversionTracking";
import ContentAnalysis from "./pages/ContentAnalysis";
import Analytics from "./pages/Analytics";
import Payroll from "./pages/Payroll";
import FraudDetection from "./pages/FraudDetection";
import DashboardSettings from "./pages/DashboardSettings";
import SubmitContent from "./pages/SubmitContent";
import AIRecommendations from "./pages/AIRecommendations";
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorOnboarding from "./pages/CreatorOnboarding";
import RealTimeMonitor from "./pages/RealTimeMonitor";
import CreatorForecasting from "./pages/CreatorForecasting";
import CampaignAutomation from "./pages/CampaignAutomation";
import SmartPayroll from "./pages/SmartPayroll";
import ContractManager from "./pages/ContractManager";
import CreatorPortfolio from "./pages/CreatorPortfolio";
import ApiDocs from "./pages/ApiDocs";
import InfluenceGraph from "./pages/InfluenceGraph";
import GlobalCompliance from "./pages/GlobalCompliance";
import CreatorLoyalty from "./pages/CreatorLoyalty";
import BenchmarkDatabase from "./pages/BenchmarkDatabase";
import DocsHub from "./pages/DocsHub";
import DevManual from "./pages/docs/DevManual";
import FullDoc from "./pages/docs/FullDoc";
import QuickSocial from "./pages/docs/QuickSocial";
import UserManual from "./pages/docs/UserManual";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";

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
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
            <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
            <Route path="/creators" element={<ProtectedRoute><Creators /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><CreatorMarketplace /></ProtectedRoute>} />
            <Route path="/conversions" element={<ProtectedRoute><ConversionTracking /></ProtectedRoute>} />
            <Route path="/content-analysis" element={<ProtectedRoute><ContentAnalysis /></ProtectedRoute>} />
            <Route path="/creator-onboarding" element={<ProtectedRoute><CreatorOnboarding /></ProtectedRoute>} />
            <Route path="/creator-dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
            <Route path="/fraud" element={<ProtectedRoute><FraudDetection /></ProtectedRoute>} />
            <Route path="/ai-insights" element={<ProtectedRoute><AIRecommendations /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
            <Route path="/submit-content" element={<ProtectedRoute><SubmitContent /></ProtectedRoute>} />
            <Route path="/realtime" element={<ProtectedRoute><RealTimeMonitor /></ProtectedRoute>} />
            <Route path="/forecasting" element={<ProtectedRoute><CreatorForecasting /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><CampaignAutomation /></ProtectedRoute>} />
            <Route path="/smart-payroll" element={<ProtectedRoute><SmartPayroll /></ProtectedRoute>} />
            <Route path="/contracts" element={<ProtectedRoute><ContractManager /></ProtectedRoute>} />
            <Route path="/creator/:id" element={<ProtectedRoute><CreatorPortfolio /></ProtectedRoute>} />
            <Route path="/api-docs" element={<ProtectedRoute><ApiDocs /></ProtectedRoute>} />
            <Route path="/influence-graph" element={<ProtectedRoute><InfluenceGraph /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><GlobalCompliance /></ProtectedRoute>} />
            <Route path="/loyalty" element={<ProtectedRoute><CreatorLoyalty /></ProtectedRoute>} />
            <Route path="/benchmarks" element={<ProtectedRoute><BenchmarkDatabase /></ProtectedRoute>} />
            <Route path="/docs" element={<ProtectedRoute><DocsHub /></ProtectedRoute>} />
            <Route path="/docs/dev-manual" element={<ProtectedRoute><DevManual /></ProtectedRoute>} />
            <Route path="/docs/full" element={<ProtectedRoute><FullDoc /></ProtectedRoute>} />
            <Route path="/docs/quick-social" element={<ProtectedRoute><QuickSocial /></ProtectedRoute>} />
            <Route path="/docs/user-manual" element={<ProtectedRoute><UserManual /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;