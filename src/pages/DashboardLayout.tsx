import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import NavbarWithScroll from "@/components/NavbarWithScroll";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";

// Paths that are only for initial onboarding; when completed and single-account plan, redirect away (connect-youtube stays accessible for Reconnect)
const ONBOARDING_ONLY_PATHS = ["/dashboard/select-product", "/dashboard/create-store"];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubscribed, hasTestSubscription, loading: subscriptionLoading, storesLimit } = useSubscription();
  const { progress, loading: progressLoading } = useOnboardingFlow();
  const [loading, setLoading] = useState(true);

  // Onboarding "done" = product + store + YouTube connected (no depenem del flag completed del backend)
  const onboardingDone = Boolean(
    progress?.product_selected && progress?.store_created && progress?.youtube_connected
  );

  // Show sidebar only while onboarding, or when plan allows more than one account (storesLimit > 1)
  const showSidebar = !progressLoading && progress && (!onboardingDone || (onboardingDone && storesLimit > 1));

  // When onboarding done and plan has only one account: block access to Select Product / Create Store (Connect YouTube stays for Reconnect)
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

  // Redirect to pricing only if no subscription AND onboarding not done (so new users go to pricing first)
  // If onboarding is complete, allow dashboard access and show upgrade CTA there instead
  useEffect(() => {
    if (subscriptionLoading || progressLoading || loading) return;
    if (isSubscribed || hasTestSubscription) return;
    if (onboardingDone) return; // Let them in; they'll see upgrade banner on overview
    navigate("/pricing");
  }, [isSubscribed, hasTestSubscription, subscriptionLoading, loading, progressLoading, onboardingDone, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavbarWithScroll />
      <div className="flex w-full">
        {showSidebar && <DashboardSidebar />}
        <main className="flex-1 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
