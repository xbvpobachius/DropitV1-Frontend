import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import NavbarWithScroll from "@/components/NavbarWithScroll";
import DashboardSidebar from "@/components/DashboardSidebar";
import AppShell from "@/components/AppShell";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";

const ONBOARDING_ONLY_PATHS: string[] = [];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubscribed, hasTestSubscription, loading: subscriptionLoading, storesLimit } = useSubscription();
  const { progress, loading: progressLoading } = useOnboardingFlow();
  const [loading, setLoading] = useState(true);

  const onboardingDone = Boolean(progress?.youtube_connected);

  const showSidebar = !progressLoading && progress && onboardingDone;

  useEffect(() => {
    if (progressLoading || !onboardingDone || storesLimit > 1) return;
    if (ONBOARDING_ONLY_PATHS.includes(location.pathname)) {
      navigate("/dashboard/calendar", { replace: true });
    }
  }, [onboardingDone, storesLimit, location.pathname, navigate, progressLoading]);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/auth");
      return;
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (subscriptionLoading || progressLoading || loading) return;
    if (isSubscribed || hasTestSubscription) return;
    if (onboardingDone) return;
    navigate("/pricing");
  }, [isSubscribed, hasTestSubscription, subscriptionLoading, loading, progressLoading, onboardingDone, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showSidebar) {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50/30">
      <NavbarWithScroll />
      <div className="flex w-full">
        <DashboardSidebar />
        <main className="flex-1 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
