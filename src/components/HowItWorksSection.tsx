import { Package, Wand2, Video, TrendingUp } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Package,
      title: "Select Your Product",
      description: "Browse curated winning products.",
    },
    {
      icon: Wand2,
      title: "Generate Your Website",
      description: "Create your product store automatically.",
    },
    {
      icon: Video,
      title: "Create and Schedule Videos",
      description: "Generate product videos and schedule YouTube uploads.",
    },
    {
      icon: TrendingUp,
      title: "Grow with Organic Traffic",
      description: "Track performance and scale your YouTube growth.",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 gradient-glow opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How <span className="text-primary">DropIt</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to automate your dropshipping business
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative card-premium p-6 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border-2 border-primary">
                  {index + 1}
                </div>
                
                <div className="mb-4 mt-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
