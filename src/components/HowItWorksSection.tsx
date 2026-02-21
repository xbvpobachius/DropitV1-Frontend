import { Youtube, Calendar, Zap } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    { icon: Youtube, title: "Connect YouTube", description: "Link your channel once. Secure OAuth, you stay in control." },
    { icon: Calendar, title: "Plan & schedule", description: "Add your Shorts to the calendar. Pick the date and time for each one." },
    { icon: Zap, title: "Publish automatically", description: "We upload at the times you set. No manual work on your side." },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three steps to automate your content
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative bg-white rounded-xl border-2 border-border p-6 hover-lift hover:border-primary/30"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground text-lg font-bold mb-4 shadow-md">
                  {index + 1}
                </div>
                <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground text-lg">{step.title}</h3>
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
