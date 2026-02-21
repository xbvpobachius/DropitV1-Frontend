import { ShoppingCart, Sparkles, Zap } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    number: "1",
    title: "Select Your Product",
    description: "Browse curated winning products.",
  },
  {
    icon: Sparkles,
    number: "2",
    title: "Generate Your Website",
    description: "Create your product store automatically.",
  },
  {
    icon: Zap,
    number: "3",
    title: "Create and Schedule Videos",
    description: "Generate product videos and schedule YouTube uploads.",
  },
  {
    icon: Zap,
    number: "4",
    title: "Grow with Organic Traffic",
    description: "Track performance and scale your YouTube growth.",
  },
];

const HowItWorks = () => {
  return (
    <section id="features" className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            How <span className="text-primary">DropIt</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to automate your entire dropshipping video marketing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="bg-white border border-border rounded-2xl p-6 h-full transition-all duration-300 hover-lift">
                {/* Step number with glow */}
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-2xl font-bold text-primary mb-4 group-hover:shadow-[0_0_20px_rgba(39,174,96,0.4)] transition-all">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>

              {/* Connecting line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
