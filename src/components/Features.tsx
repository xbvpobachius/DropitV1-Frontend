import { Video, Calendar, Globe, BarChart3 } from "lucide-react";
import featureVideo from "@/assets/feature-video.jpg";
import featureCalendar from "@/assets/feature-calendar.jpg";
import featureWebsite from "@/assets/feature-website.jpg";

const features = [
  {
    icon: Video,
    title: "AI Video Generator",
    description: "Transform raw product footage into viral-style YouTube Shorts automatically. No editing skills required.",
    image: featureVideo,
  },
  {
    icon: Calendar,
    title: "Smart Scheduler",
    description: "Publish automatically to your YouTube channel at optimal times. Scale your reach effortlessly.",
    image: featureCalendar,
  },
  {
    icon: Globe,
    title: "AI Website Builder",
    description: "Generate beautiful, high-converting landing pages for each product in seconds. Mobile-optimized by default.",
    image: featureWebsite,
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track performance, engagement, and sales metrics in real-time. Make data-driven decisions instantly.",
    image: featureVideo,
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4 bg-secondary/30 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Powerful <span className="text-primary">Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to dominate organic dropshipping on YouTube
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl card-premium hover-lift"
            >
              {/* Feature Image */}
              <div className="aspect-video overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="relative z-10">
                  {/* Icon with glow */}
                  <div className="inline-flex p-4 rounded-xl bg-primary/10 border border-primary/20 mb-6 group-hover:shadow-[0_0_30px_rgba(39,174,96,0.3)] transition-all">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>

                  {/* Text */}
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
