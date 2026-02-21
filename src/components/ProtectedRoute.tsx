import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredStep: string;
}

export const ProtectedRoute = ({ children, requiredStep }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccessStep, requiresSubscription, loading, getNextStep, progress } = useOnboardingFlow();

  // Check if coming from previous step
  const fromPreviousStep = (location.state as any)?.fromPreviousStep;

  useEffect(() => {
    console.log("ProtectedRoute check:", { 
      loading, 
      requiresSubscription, 
      requiredStep,
      canAccess: canAccessStep(requiredStep),
      fromPreviousStep,
      onboardingCompleted: progress?.onboarding_completed
    });

    if (loading) return;

    // Allow overview when onboarding is complete even without subscription (show upgrade CTA on page)
    const canAccessOverviewWithoutSub = requiredStep === "/dashboard/overview" && canAccessStep(requiredStep);
    if (requiresSubscription && !canAccessOverviewWithoutSub) {
      console.log("No subscription, redirecting to pricing");
      navigate("/pricing");
      return;
    }

    // If onboarding is completed and trying to access onboarding steps, redirect to overview
    const onboardingSteps = ["/dashboard/connect-youtube"];
    
    if (progress?.onboarding_completed && onboardingSteps.includes(requiredStep)) {
      console.log("Onboarding completed, redirecting to overview");
      navigate("/dashboard/overview", { replace: true });
      return;
    }

    // Check if user can access this step (skip if coming from previous step)
    if (!fromPreviousStep && !canAccessStep(requiredStep)) {
      const nextStep = getNextStep();
      console.log("Cannot access step, redirecting to:", nextStep);
      navigate(nextStep);
    }
  }, [loading, requiresSubscription, canAccessStep, requiredStep, navigate, getNextStep, progress, fromPreviousStep]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const allowOverviewWithoutSub = requiredStep === "/dashboard/overview" && canAccessStep(requiredStep);
  if ((requiresSubscription && !allowOverviewWithoutSub) || (!fromPreviousStep && !canAccessStep(requiredStep))) {
    return null;
  }

  return <>{children}</>;
};
