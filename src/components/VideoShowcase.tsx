import { ShoppingCart, Sparkles, Zap, Youtube } from "lucide-react";
import videoSelectProduct from "@/assets/video-select-product.jpg";
import videoAiWebsite from "@/assets/video-ai-website.jpg";
import videoSchedule from "@/assets/video-schedule.jpg";
import videoConnect from "@/assets/video-connect.jpg";
import videoCompleteWorkflow from "@/assets/video-complete-workflow.jpg";

const workflows = [
  { icon: ShoppingCart, step: "1", title: "Select product", description: "Choose from curated products", image: videoSelectProduct },
  { icon: Sparkles, step: "2", title: "AI generates store", description: "Landing page created instantly", image: videoAiWebsite },
  { icon: Zap, step: "3", title: "Schedule videos", description: "Daily content automation", image: videoSchedule },
  { icon: Youtube, step: "4", title: "Publish & grow", description: "YouTube Shorts automation", image: videoConnect },
];

const VideoShowcase = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            See it in action
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            How the workflow runs from selection to publish
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {workflows.map((workflow, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-border overflow-hidden hover-lift"
            >
              <div className="aspect-video relative overflow-hidden bg-muted/50">
                <img
                  src={workflow.image}
                  alt={workflow.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-xs font-medium text-white/90">Step {workflow.step}</span>
                  <p className="font-semibold text-white">{workflow.title}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">{workflow.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
          <div className="aspect-video relative">
            <img
              src={videoCompleteWorkflow}
              alt="Complete workflow"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                <svg className="h-8 w-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-6 text-center">
            <h3 className="font-semibold text-foreground">Complete workflow demo</h3>
            <p className="text-sm text-muted-foreground mt-1">From selection to publish in under 2 minutes</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
