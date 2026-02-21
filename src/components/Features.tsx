import { Video, Calendar, Globe, BarChart3 } from "lucide-react";
import featureVideo from "@/assets/feature-video.jpg";
import featureCalendar from "@/assets/feature-calendar.jpg";
import featureWebsite from "@/assets/feature-website.jpg";

const features = [
  {
    icon: Video,
    title: "AI Video Generator",
    description: "Turn product footage into YouTube Shorts. No editing skills required.",
    image: featureVideo,
  },
  {
    icon: Calendar,
    title: "Smart Scheduler",
    description: "Publish automatically at optimal times. Keep your channel consistent.",
    image: featureCalendar,
  },
  {
    icon: Globe,
    title: "AI Website Builder",
    description: "Generate landing pages for each product in seconds.",
    image: featureWebsite,
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track views, engagement and performance in real time.",
    image: featureVideo,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Built for creators
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to run your Shorts workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl border border-border overflow-hidden hover-lift"
            >
              <div className="aspect-video overflow-hidden bg-muted/50">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="inline-flex p-2.5 rounded-lg bg-primary/5 border border-primary/10 mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
