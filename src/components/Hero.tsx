import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20 bg-gradient-to-br from-white via-muted/20 to-white">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-fade-in">
          <span className="text-sm font-medium text-primary">✨ DropIt — Automate Your YouTube Growth</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in text-foreground">
          Automate Your
          <br />
          <span className="text-primary">YouTube Growth</span>
        </h1>

        <p
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Dropit helps you create, schedule and publish product videos automatically — so you can grow using organic YouTube traffic.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all group"
          >
            Start Free Trial
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 rounded-lg bg-white hover:bg-muted transition-all"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>

        {/* Trust indicators */}
        <div
          className="flex flex-wrap justify-center gap-8 pt-12 text-sm text-muted-foreground animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
            <span>7-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
