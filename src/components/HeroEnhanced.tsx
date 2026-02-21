import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const HeroEnhanced = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-52 bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100%_24px]" />

      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-fade-in">
          <span className="w-2 h-2 bg-primary rounded-full" />
          <span className="text-sm font-medium text-primary">DropIt — YouTube Shorts Automation</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-foreground animate-fade-in">
          Schedule & publish
          <br />
          <span className="text-primary">Shorts on autopilot</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed">
          Create, schedule and publish product Shorts to YouTube automatically. Built for creators who want consistency without burnout.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <Link to="/pricing">
            <Button
              size="lg"
              className="text-base px-8 py-6 rounded-lg font-semibold"
            >
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 py-6 rounded-lg border-border hover:bg-muted/50"
          >
            <Play className="mr-2 h-4 w-4" />
            Watch demo
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground animate-fade-in">
          <span>No credit card</span>
          <span>7-day trial</span>
          <span>Cancel anytime</span>
        </div>

        <div className="pt-12 animate-fade-in">
          <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border-2 border-primary/20 shadow-xl">
            <img
              src={heroDashboard}
              alt="DropIt Dashboard"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroEnhanced;
