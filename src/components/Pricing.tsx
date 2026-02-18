import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$59",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "1 channel",
      "1 product",
      "1 video per day",
      "YouTube publishing",
      "Basic analytics",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For growing businesses",
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
  },
  {
    name: "Business",
    price: "$149",
    period: "/month",
    description: "Scale your operations",
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
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Try DropIt free for 7 days. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 card-premium transition-all duration-300 hover-lift group ${
                plan.popular
                  ? "border-2 border-primary glow-primary"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-sm font-semibold shadow-medium">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-lg py-6 font-semibold transition-all ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90 text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(39,174,96,0.5)]"
                    : "bg-card hover:bg-card/80 text-foreground border border-primary/20 hover:border-primary/40"
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Feature comparison hint */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            All plans include automatic updates and 99.9% uptime guarantee
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
