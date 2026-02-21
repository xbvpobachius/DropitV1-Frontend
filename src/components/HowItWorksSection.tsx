import { Package, Wand2, Video, TrendingUp } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    { icon: Package, title: "Select product", description: "Choose from curated winning products." },
    { icon: Wand2, title: "Generate store", description: "Create your product landing page automatically." },
    { icon: Video, title: "Create & schedule Shorts", description: "Generate videos and schedule YouTube uploads." },
    { icon: TrendingUp, title: "Grow organically", description: "Track performance and scale your channel." },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Four steps to automate your Shorts workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative bg-white rounded-xl border-2 border-border p-6 hover-lift hover:border-primary/30"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4 shadow-md">
                  {index + 1}
                </div>
                <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
