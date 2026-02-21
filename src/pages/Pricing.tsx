import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SUBSCRIPTION_TIERS } from "@/contexts/SubscriptionContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import NavbarWithScroll from "@/components/NavbarWithScroll";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PlanName = keyof typeof SUBSCRIPTION_TIERS;

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [validationCode, setValidationCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [planIdByTier, setPlanIdByTier] = useState<Record<string, string>>({});
  const [codeSubmitting, setCodeSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setTestSubscription, subscriptionTier, isSubscribed, hasTestSubscription } = useSubscription();

  const VALID_CODE = "DROP31X";

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("access_token"));
  }, []);

  // Fetch plan UUIDs from backend for checkout
  useEffect(() => {
    import("@/lib/api").then(({ apiFetch }) =>
      apiFetch<{ id: string; name: string }[]>("/billing/plans")
      .then((plans) => {
        const map: Record<string, string> = {};
        plans.forEach((p) => {
          const tier = p.name.toLowerCase() as PlanName;
          if (SUBSCRIPTION_TIERS[tier]) map[tier] = p.id;
        });
        setPlanIdByTier(map);
      }).catch(() => {}));
  }, []);

  const handleCheckout = async (planTier: PlanName) => {
    try {
      setLoading(true);

      if (!localStorage.getItem("access_token")) {
        navigate("/auth?mode=signup");
        return;
      }

      const planId = planIdByTier[planTier];
      if (!planId) {
        toast({
          title: "Error",
          description: "Plan not available. Try again in a moment.",
          variant: "destructive",
        });
        return;
      }

      const { apiFetch } = await import("@/lib/api");
      const data = await apiFetch<{ url?: string }>(
        `/billing/create-checkout-session?plan_id=${encodeURIComponent(planId)}`,
        { method: "POST" }
      );

      if (data?.url) {
        window.open(data.url, "_blank");
        setTimeout(() => navigate("/dashboard/select-product"), 1000);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCodeDialog = () => {
    setShowCodeDialog(true);
    setValidationCode("");
    setCodeError("");
  };

  const handleValidateCode = async () => {
    if (validationCode.trim() !== VALID_CODE) {
      setCodeError("Invalid code. Please enter the correct code.");
      return;
    }

    if (!localStorage.getItem("access_token")) {
      setShowCodeDialog(false);
      navigate("/auth?mode=signup");
      return;
    }

    setCodeSubmitting(true);
    try {
      const { apiFetch } = await import("@/lib/api");
      await apiFetch("/billing/activate-test", { method: "POST" });
      setShowCodeDialog(false);
      handleTestPayment();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo activar la subscripción de prueba",
        variant: "destructive",
      });
    } finally {
      setCodeSubmitting(false);
    }
  };

  const handleTestPayment = () => {
    console.log("Setting test subscription...");

    // Set test subscription FIRST in sessionStorage
    sessionStorage.setItem("test_subscription", "true");
    setTestSubscription(true);

    console.log("Test subscription set in sessionStorage");

    toast({
      title: "Simulated payment successful",
      description: "Redirecting to onboarding...",
    });

    console.log("Navigating to dashboard...");

    // Use window.location for hard navigation to ensure state refresh
    setTimeout(() => {
      window.location.href = "/dashboard/select-product";
    }, 500);
  };

  const plans = [
    {
      name: "Starter",
      tier: "starter" as keyof typeof SUBSCRIPTION_TIERS,
      price: "$59",
      period: "/mo",
      trial: "7-day free trial",
      priceId: SUBSCRIPTION_TIERS.starter.price_id,
      features: [
        "1 channel",
        "1 product",
        "1 video per day",
        "YouTube publishing",
        "Basic analytics",
      ],
      cta: "Start Free Trial",
      popular: false,
      hasTrial: true,
    },
    {
      name: "Pro",
      tier: "pro" as keyof typeof SUBSCRIPTION_TIERS,
      price: "$99",
      period: "/mo",
      trial: "Most popular",
      priceId: SUBSCRIPTION_TIERS.pro.price_id,
      features: [
        "2 channels",
        "2 products",
        "2 videos per day (per channel)",
        "YouTube publishing",
        "Advanced analytics",
        "Priority support",
      ],
      cta: "Subscribe Now",
      popular: true,
      hasTrial: false,
    },
    {
      name: "Business",
      tier: "business" as keyof typeof SUBSCRIPTION_TIERS,
      price: "$149",
      period: "/mo",
      trial: "Best value",
      priceId: SUBSCRIPTION_TIERS.business.price_id,
      features: [
        "5 channels",
        "5 products",
        "3 videos per day (per channel)",
        "YouTube publishing",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
      cta: "Subscribe Now",
      popular: false,
      hasTrial: false,
    },
  ];

  // Check if this is the user's current plan - only if authenticated
  const isCurrentPlan = (planTier: keyof typeof SUBSCRIPTION_TIERS) => {
    // Must be authenticated to have an active plan
    if (!isAuthenticated) {
      return false;
    }
    
    // If user has test subscription, show starter as active
    if (hasTestSubscription && planTier === "starter") {
      return true;
    }
    
    // Otherwise check for real subscription
    return isSubscribed && subscriptionTier === planTier;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <NavbarWithScroll />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Simple, transparent pricing
            </h1>
            <p className="text-muted-foreground">
              Start with a free trial. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isActive = isCurrentPlan(plan.tier);

              return (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-xl border p-6 ${
                    plan.popular && !isActive ? "border-primary ring-2 ring-primary/20" : "border-border"
                  } ${isActive ? "border-primary/50 ring-2 ring-primary/10" : ""}`}
                >
                  {plan.popular && !isActive && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        Most popular
                      </span>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Current plan
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-primary mt-1">{plan.trial}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(plan.tier)}
                    disabled={loading || isActive}
                    variant={isActive ? "outline" : plan.popular ? "default" : "outline"}
                    className={`w-full ${isActive ? "cursor-not-allowed opacity-70" : ""}`}
                    size="lg"
                  >
                    {isActive ? "Active plan" : loading ? "Loading..." : plan.cta}
                  </Button>

                  {plan.name === "Starter" && !isActive && (
                    <Button onClick={handleOpenCodeDialog} variant="ghost" className="w-full mt-2" size="sm">
                      Test: Simulate payment
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include core automation.{" "}
              <Link to="/help" className="text-primary hover:underline">
                Learn more
              </Link>
            </p>
          </div>
        </div>

        {/* Code Validation Dialog */}
        <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enter Validation Code</DialogTitle>
              <DialogDescription>
                Please enter the valid code to proceed with payment simulation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Validation Code</Label>
                <Input
                  id="code"
                  placeholder="Enter code"
                  value={validationCode}
                  onChange={(e) => {
                    setValidationCode(e.target.value);
                    setCodeError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleValidateCode();
                    }
                  }}
                  className={codeError ? "border-red-500" : ""}
                />
                {codeError && (
                  <p className="text-sm text-red-500">{codeError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleValidateCode} disabled={codeSubmitting}>
                {codeSubmitting ? "Activating..." : "Validate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
