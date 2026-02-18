import { ShoppingCart, Sparkles, Zap, Youtube } from "lucide-react";
import videoSelectProduct from "@/assets/video-select-product.jpg";
import videoAiWebsite from "@/assets/video-ai-website.jpg";
import videoSchedule from "@/assets/video-schedule.jpg";
import videoConnect from "@/assets/video-connect.jpg";
import videoCompleteWorkflow from "@/assets/video-complete-workflow.jpg";

const workflows = [
  {
    icon: ShoppingCart,
    step: "1",
    title: "Select Product",
    description: "Choose from curated products",
    image: videoSelectProduct,
  },
  {
    icon: Sparkles,
    step: "2", 
    title: "AI Generates Website",
    description: "Landing page created instantly",
    image: videoAiWebsite,
  },
  {
    icon: Zap,
    step: "3",
    title: "Schedule Videos",
    description: "Daily content automation",
    image: videoSchedule,
  },
  {
    icon: Youtube,
    step: "4",
    title: "Publish & Grow",
    description: "YouTube Shorts automation",
    image: videoConnect,
  },
];

const VideoShowcase = () => {
  return (
    <section className="py-24 px-4 bg-secondary/30 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Watch DropIt in <span className="text-primary">Action</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how our AI automates your entire dropshipping workflow in real-time
          </p>
        </div>

        {/* Video demonstration grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {workflows.map((workflow, index) => (
            <div
              key={index}
              className="card-premium rounded-2xl overflow-hidden hover-lift"
            >
              {/* Video preview */}
              <div className="aspect-video bg-gradient-to-br from-card to-background border-b border-primary/10 relative group overflow-hidden">
                <img 
                  src={workflow.image} 
                  alt={`${workflow.title} demonstration`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end p-6">
                  <div className="space-y-1">
                    <div className="text-sm text-primary font-semibold">Step {workflow.step}</div>
                    <div className="text-foreground font-semibold text-lg">{workflow.title}</div>
                  </div>
                </div>
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                    <svg className="h-8 w-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-6">
                <p className="text-muted-foreground">{workflow.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Large featured video */}
        <div className="card-premium rounded-3xl overflow-hidden group cursor-pointer">
          <div className="aspect-video bg-gradient-to-br from-card via-background to-card relative overflow-hidden">
            <img 
              src={videoCompleteWorkflow} 
              alt="Complete DropIt workflow demonstration"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary/40 group-hover:bg-primary/30 transition-all animate-glow-pulse">
                  <svg className="h-12 w-12 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Complete Workflow Demo</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Watch a full product launch from selection to sales in under 2 minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
