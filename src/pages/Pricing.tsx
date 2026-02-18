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
    <div className="min-h-screen bg-background">
      <NavbarWithScroll />

      <main className="pt-44 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with a free trial. No credit card required.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const isActive = isCurrentPlan(plan.tier);

              return (
                <div
                  key={plan.name}
                  className={`relative card-premium rounded-2xl p-8 hover-lift ${
                    plan.popular && !isActive ? "ring-2 ring-primary glow-primary" : ""
                  } ${isActive ? "ring-2 ring-green-500 glow-strong" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {plan.popular && !isActive && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="gradient-primary px-4 py-1 rounded-full text-sm font-semibold text-white">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-1 rounded-full text-sm font-semibold text-white shadow-lg">
                        ✓ Current Plan
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-2">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">{plan.period}</span>
                    </div>
                    <p className="text-sm text-primary">{plan.trial}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(plan.tier)}
                    disabled={loading || isActive}
                    className={`w-full ${
                      isActive
                        ? "bg-green-500/20 text-green-600 border-2 border-green-500 cursor-not-allowed"
                        : plan.popular
                          ? "bg-primary hover:bg-primary/90 text-white font-semibold"
                          : "bg-secondary hover:bg-secondary/80"
                    }`}
                    size="lg"
                  >
                    {isActive ? "Active Plan" : loading ? "Loading..." : plan.cta}
                  </Button>

                  {plan.name === "Starter" && !isActive && (
                    <Button onClick={handleOpenCodeDialog} variant="outline" className="w-full mt-2" size="sm">
                      Test: Simulate Payment
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-20 text-center">
            <p className="text-muted-foreground">
              All plans include our core AI automation features.{" "}
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
              <Button onClick={handleValidateCode} className="gradient-primary" disabled={codeSubmitting}>
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
