import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

interface OnboardingProgress {
  products_created: number;
  stores_created: number;
  youtube_connected: boolean;
  onboarding_completed: boolean;
  product_selected: boolean;
  store_created: boolean;
  calendar_viewed: boolean;
}

interface BackendProgress {
  product_selected: boolean;
  store_created: boolean;
  cloud_project_connected: boolean;
  youtube_connected: boolean;
  notifications_configured: boolean;
  completed: boolean;
}

function backendToFrontend(data: BackendProgress): OnboardingProgress {
  return {
    product_selected: data.product_selected,
    store_created: data.store_created,
    youtube_connected: data.youtube_connected,
    calendar_viewed: data.notifications_configured,
    onboarding_completed: data.completed,
    products_created: 0,
    stores_created: 0,
  };
}

function frontendToBackend(updates: Partial<OnboardingProgress>): Partial<BackendProgress> {
  const out: Partial<BackendProgress> = {};
  if (updates.product_selected !== undefined) out.product_selected = updates.product_selected;
  if (updates.store_created !== undefined) out.store_created = updates.store_created;
  if (updates.youtube_connected !== undefined) out.youtube_connected = updates.youtube_connected;
  if (updates.calendar_viewed !== undefined) out.notifications_configured = updates.calendar_viewed;
  if (updates.onboarding_completed !== undefined) out.completed = updates.onboarding_completed;
  return out;
}

export const useOnboardingFlow = () => {
  const navigate = useNavigate();
  const { isSubscribed, loading: subscriptionLoading, hasTestSubscription } = useSubscription();
  const { toast } = useToast();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      if (localStorage.getItem("access_token")) {
        const data = await apiFetch<BackendProgress>("/onboarding/progress");
        setProgress(backendToFrontend(data));
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (error) throw error;
        setProgress(data);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const updateProgress = async (updates: Partial<OnboardingProgress>) => {
    try {
      if (localStorage.getItem("access_token")) {
        const body = frontendToBackend(updates);
        if (Object.keys(body).length === 0) return;
        await apiFetch("/onboarding/progress", {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        await fetchProgress();
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { error } = await supabase
          .from("user_progress")
          .update(updates)
          .eq("user_id", session.user.id);
        if (error) throw error;
        await fetchProgress();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const getNextStep = (): string => {
    if (!progress) return "/dashboard/connect-youtube";
    if (!progress.youtube_connected) return "/dashboard/connect-youtube";
    return "/dashboard/overview";
  };

  const canAccessStep = (step: string): boolean => {
    if (!progress) return step === "/dashboard/connect-youtube";

    switch (step) {
      case "/dashboard/connect-youtube":
        return true;
      case "/dashboard/calendar":
      case "/dashboard/overview":
      case "/dashboard/upload":
      case "/dashboard/settings":
        return progress.youtube_connected;
      default:
        return false;
    }
  };

  const requiresSubscription = !subscriptionLoading && !isSubscribed && !hasTestSubscription;

  console.log("useOnboardingFlow state:", {
    subscriptionLoading,
    isSubscribed,
    hasTestSubscription,
    requiresSubscription,
    loading
  });

  return {
    progress,
    loading: loading || subscriptionLoading,
    updateProgress,
    getNextStep,
    canAccessStep,
    requiresSubscription,
    refetch: fetchProgress,
  };
};
