import { Calendar, Clock, Youtube, Zap } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Plan ahead",
    description: "Schedule your Shorts days or weeks in advance. Batch your content and forget about daily posting.",
  },
  {
    icon: Clock,
    title: "Set your times",
    description: "Choose when your content goes live. One schedule for your whole channel.",
  },
  {
    icon: Youtube,
    title: "Connect once",
    description: "Link your YouTube channel. We publish automatically at the times you set.",
  },
  {
    icon: Zap,
    title: "Stay consistent",
    description: "Build your audience with a steady flow of content. No more last-minute uploads.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-blue-50/40 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Built for busy creators
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple automation so you can focus on creating
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl border-2 border-border p-6 hover-lift hover:border-primary/30"
            >
              <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
