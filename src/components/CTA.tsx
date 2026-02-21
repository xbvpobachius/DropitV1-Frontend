import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-blue-50/50 to-blue-50/30">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-white rounded-2xl border-2 border-primary/20 p-10 md:p-14 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to automate your content?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Plan once, publish on autopilot. Start your free trial — no credit card required.
          </p>
          <Link to="/pricing">
            <Button size="lg" className="font-semibold">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-6">
            7-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
