import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const HeroEnhanced = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-52">
      {/* Animated background with gradient motion */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Grid overlay for tech feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(39,174,96,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(39,174,96,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-block px-5 py-2 rounded-full card-premium mb-4 animate-fade-in">
          <span className="text-sm font-medium text-primary flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            DropIt — Automate Your YouTube Growth
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight animate-fade-in">
          <span className="text-foreground">Automate Youtube </span>
          <span className="text-primary drop-shadow-[0_0_30px_rgba(39,174,96,0.5)]">Organic Dropshipping</span>
        </h1>

        <p
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in leading-relaxed"
          style={{ animationDelay: "0.2s" }}
        >
          Dropit helps you create, schedule and publish product videos automatically — so you can grow using organic YouTube traffic.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <Link to="/pricing">
            <Button
              size="lg"
              className="text-lg px-10 py-7 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-all group hover:scale-105 hover:shadow-[0_0_40px_rgba(39,174,96,0.6)]"
            >
              Start Free Trial
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-10 py-7 rounded-lg border-primary/30 hover:border-primary hover:bg-primary/10 transition-all group"
          >
            <Play className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
            Watch Demo
          </Button>
        </div>

        {/* Trust indicators with elegant styling */}
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

        {/* Dashboard preview image */}
        <div className="pt-16 animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-medium border border-primary/20">
              <img 
                src={heroDashboard} 
                alt="DropIt Dashboard Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Glow effect under video */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroEnhanced;
