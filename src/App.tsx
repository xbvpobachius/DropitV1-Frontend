import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import DashboardLayout from "./pages/DashboardLayout";
import SelectProduct from "./pages/dashboard/SelectProduct";
import CreateStore from "./pages/dashboard/CreateStore";
import ConnectInstagram from "./pages/dashboard/ConnectInstagram";
import ContentCalendar from "./pages/dashboard/ContentCalendar";
import Notifications from "./pages/dashboard/Notifications";
import Overview from "./pages/dashboard/Overview";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import BillingSuccess from "./pages/BillingSuccess";
import BillingCancel from "./pages/BillingCancel";

const queryClient = new QueryClient();

function DashboardRedirect() {
  const navigate = useNavigate();
  const { getNextStep, loading } = useOnboardingFlow();
  useEffect(() => {
    if (!loading) navigate(getNextStep(), { replace: true });
  }, [loading]);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SubscriptionProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/billing/success" element={<BillingSuccess />} />
          <Route path="/billing/cancel" element={<BillingCancel />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/products" element={<Products />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          
          {/* Dashboard routes with sidebar */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRedirect />} />
            <Route path="select-product" element={<SelectProduct />} />
            <Route path="create-store" element={<CreateStore />} />
            <Route path="connect-youtube" element={<ConnectInstagram />} />
            <Route path="connect-instagram" element={<Navigate to="connect-youtube" replace />} />
            <Route path="calendar" element={<ContentCalendar />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="overview" element={<Overview />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;
