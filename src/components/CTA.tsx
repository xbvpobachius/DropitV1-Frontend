import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Dynamic background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="card-premium rounded-3xl p-12 md:p-16 text-center space-y-8 glow-primary">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight text-foreground">
            Ready to Automate Your
            <br />
            <span className="text-primary drop-shadow-[0_0_30px_rgba(39,174,96,0.5)]">
              Dropshipping Videos?
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start scaling your YouTube dropshipping business with AI automation today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-10 py-7 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-all group hover:scale-105 hover:shadow-[0_0_40px_rgba(39,174,96,0.6)]"
            >
              Start Free Trial
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card required • 7-day free trial
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">AI</p>
              <p className="text-sm text-muted-foreground">Video Generation</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">YouTube</p>
              <p className="text-sm text-muted-foreground">Auto Publishing</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">Automation</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
