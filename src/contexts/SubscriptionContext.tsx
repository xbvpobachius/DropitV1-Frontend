import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

// Subscription tier mapping
export const SUBSCRIPTION_TIERS = {
  starter: {
    product_id: "prod_TCOmA6evyir92g",
    price_id: "price_1SFzz4Q0YNzWEbyHB7YZFxt5",
    name: "Starter",
    products_limit: 1,
    stores_limit: 1,
  },
  pro: {
    product_id: "prod_TCOmD8WsWWhvAi",
    price_id: "price_1SFzzGQ0YNzWEbyH9SbeDeyx",
    name: "Pro",
    products_limit: 2,
    stores_limit: 2,
  },
  business: {
    product_id: "prod_TCOnYPe0b8jmhO",
    price_id: "price_1SFzzTQ0YNzWEbyHbfeHpfF5",
    name: "Business",
    products_limit: 3,
    stores_limit: 3,
  },
} as const;

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionTier: keyof typeof SUBSCRIPTION_TIERS | null;
  subscriptionEnd: string | null;
  subscriptionStatus: string | null;
  productsLimit: number;
  storesLimit: number;
  checkSubscription: () => Promise<void>;
  loading: boolean;
  hasTestSubscription: boolean;
  setTestSubscription: (value: boolean) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
};

/** True if test subscription is stored (global or any per-user key). */
function hasTestSubscriptionInStorage(): boolean {
  if (typeof window === "undefined") return false;
  if (!localStorage.getItem("access_token")) return false;
  if (sessionStorage.getItem("test_subscription") === "true") return true;
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("test_subscription_") && sessionStorage.getItem(key) === "true") return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<keyof typeof SUBSCRIPTION_TIERS | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTestSubscription, setHasTestSubscription] = useState(hasTestSubscriptionInStorage);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const recheckTestSubscription = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setCurrentUserId(null);
      setHasTestSubscription(false);
      return;
    }
    // Set immediately from storage so Dropit-only users see test sub before Supabase resolves
    setHasTestSubscription(hasTestSubscriptionInStorage());
    const globalTest = sessionStorage.getItem("test_subscription") === "true";
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id ?? null;
      setCurrentUserId(userId);
      if (userId) {
        const userKey = sessionStorage.getItem(`test_subscription_${userId}`) === "true";
        setHasTestSubscription(userKey || globalTest);
      } else {
        setHasTestSubscription(globalTest);
      }
    });
  };

  // Check sessionStorage on mount and when auth changes (canvi d'usuari / sign out)
  useEffect(() => {
    recheckTestSubscription();

    const onAuthChange = () => {
      if (!localStorage.getItem("access_token") && !document.hidden) {
        setHasTestSubscription(false);
        setCurrentUserId(null);
        setIsSubscribed(false);
        setSubscriptionTier(null);
      } else {
        recheckTestSubscription();
        checkSubscription(); // refetch real subscription from API (e.g. after Stripe redirect)
      }
    };

    window.addEventListener("dropit-auth-change", onAuthChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id;
      setCurrentUserId(userId || null);
      if (userId) {
        setHasTestSubscription(sessionStorage.getItem(`test_subscription_${userId}`) === "true");
      } else if (localStorage.getItem("access_token")) {
        setHasTestSubscription(sessionStorage.getItem("test_subscription") === "true");
      } else {
        setHasTestSubscription(false);
      }
    });

    return () => {
      window.removeEventListener("dropit-auth-change", onAuthChange);
      subscription.unsubscribe();
    };
  }, []);

  const getTierFromProductId = (productId: string): keyof typeof SUBSCRIPTION_TIERS | null => {
    for (const [key, value] of Object.entries(SUBSCRIPTION_TIERS)) {
      if (value.product_id === productId) {
        return key as keyof typeof SUBSCRIPTION_TIERS;
      }
    }
    return null;
  };

  const checkSubscription = async () => {
    try {
      // Dropit auth: check backend subscription first (real plan in DB)
      if (localStorage.getItem("access_token")) {
        try {
          const data = await apiFetch<{ plan: { name: string }; status: string }>("/billing/subscription");
          setIsSubscribed(true);
          setSubscriptionEnd(null);
          setSubscriptionStatus(data.status || "active");
          const tier = data.plan?.name?.toLowerCase();
          if (tier === "starter" || tier === "pro" || tier === "business") {
            setSubscriptionTier(tier as keyof typeof SUBSCRIPTION_TIERS);
          } else {
            setSubscriptionTier("starter");
          }
          setLoading(false);
          return;
        } catch {
          // 403 or error = no subscription from backend; fall through to test subscription check
        }
        // Dropit auth + no backend sub: check test subscription (sessionStorage, global or per-user)
        if (hasTestSubscriptionInStorage()) {
          setIsSubscribed(true);
          setSubscriptionTier("starter");
          setSubscriptionEnd(null);
          setSubscriptionStatus("test");
          setHasTestSubscription(true);
          setLoading(false);
          return;
        }
        setIsSubscribed(false);
        setSubscriptionTier(null);
        setLoading(false);
        return;
      }

      // If test subscription is active (from state), set as Starter tier
      if (hasTestSubscription) {
        setIsSubscribed(true);
        setSubscriptionTier("starter");
        setSubscriptionEnd(null);
        setSubscriptionStatus("test");
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsSubscribed(false);
        setSubscriptionTier(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) {
        console.error("Error checking subscription:", error);
        toast({
          title: "Error",
          description: "Failed to check subscription status",
          variant: "destructive",
        });
        setIsSubscribed(false);
        setSubscriptionTier(null);
      } else {
        setIsSubscribed(data.subscribed);
        setSubscriptionEnd(data.subscription_end);
        setSubscriptionStatus(data.status);
        
        if (data.subscribed && data.product_id) {
          const tier = getTierFromProductId(data.product_id);
          setSubscriptionTier(tier);
        } else {
          setSubscriptionTier(null);
        }
      }
    } catch (error) {
      console.error("Error in checkSubscription:", error);
      setIsSubscribed(false);
      setSubscriptionTier(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => subscription.unsubscribe();
  }, [hasTestSubscription]); // Re-run when test subscription changes

  const tierLimits = subscriptionTier ? SUBSCRIPTION_TIERS[subscriptionTier] : { products_limit: 0, stores_limit: 0 };

  const setTestSubscription = (value: boolean) => {
    setHasTestSubscription(value);

    if (currentUserId) {
      const testSubKey = `test_subscription_${currentUserId}`;
      if (value) sessionStorage.setItem(testSubKey, "true");
      else sessionStorage.removeItem(testSubKey);
    }
    // Dropit auth (no Supabase): use global key so it survives reload
    if (value) sessionStorage.setItem("test_subscription", "true");
    else sessionStorage.removeItem("test_subscription");
  };

  console.log("SubscriptionContext state:", {
    isSubscribed,
    hasTestSubscription,
    loading
  });

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        subscriptionTier,
        subscriptionEnd,
        subscriptionStatus,
        productsLimit: tierLimits.products_limit,
        storesLimit: tierLimits.stores_limit,
        checkSubscription,
        loading,
        hasTestSubscription,
        setTestSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
