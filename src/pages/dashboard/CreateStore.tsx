import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ExternalLink, Sparkles, GraduationCap, Store } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const CreateStore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refetch } = useOnboardingFlow();
  const [currentStep] = useState(2);
  const totalSteps = 4;
  const [showTutorials, setShowTutorials] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const storeOptions = [
    {
      id: "skip",
      title: "I Already Have a Store",
      description: "Skip this step and continue with your existing store setup",
      Icon: Store,
      action: "skip",
      gradient: "from-primary/20 to-primary/10",
      iconColor: "text-primary"
    },
    {
      id: "external",
      title: "Use AI Store Builder",
      description: "Build your store with BuildYourStore.ai - one of the best external AI-powered tools available",
      Icon: Sparkles,
      action: "external",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
      badge: "External Tool"
    },
    {
      id: "learn",
      title: "Learn to Build Manually",
      description: "Follow comprehensive tutorials and resources to create your own custom store",
      Icon: GraduationCap,
      action: "learn",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500"
    }
  ];

  const tutorials = [
    { title: "Choose your e-commerce platform", completed: false },
    { title: "Set up your domain and hosting", completed: false },
    { title: "Design your store layout", completed: false },
    { title: "Add products and configure payments", completed: false },
    { title: "Set up shipping and tax settings", completed: false },
    { title: "Test your store before launch", completed: false },
  ];

  const handleOptionSelect = async (action: string) => {
    if (action === "skip") {
      setSubmitting(true);
      try {
        await apiFetch("/users/stores", {
          method: "POST",
          body: JSON.stringify({ type: "existing", shopify_url: null }),
        });
        await apiFetch("/onboarding/progress", {
          method: "PATCH",
          body: JSON.stringify({ store_created: true }),
        });
        await refetch();
        navigate("/dashboard/connect-youtube", { state: { fromPreviousStep: true } });
      } catch (error) {
        console.error("Create store / onboarding error:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudo guardar. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    } else if (action === "external") {
      window.open("https://www.buildyourstore.ai/", "_blank");
    } else if (action === "learn") {
      setShowTutorials(true);
    }
  };

  return (
    <ProtectedRoute requiredStep="/dashboard/create-store">
      <div className="p-8 pt-32 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create Store</h1>
          <p className="text-muted-foreground">Set up your automated dropshipping store in minutes</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Choose Your Path to Success
            </h2>
            <p className="text-muted-foreground text-lg">Select the option that best fits your needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {storeOptions.map((option, index) => (
              <Card
                key={option.id}
                className="bg-white border border-border cursor-pointer transition-all duration-500 hover-lift hover:shadow-2xl group overflow-hidden relative animate-fade-in border-2 border-transparent hover:border-primary/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative p-8 flex flex-col h-full">
                  {option.badge && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      <ExternalLink className="w-3 h-3" />
                      {option.badge}
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <option.Icon className={`w-8 h-8 ${option.iconColor}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {option.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-6 flex-grow leading-relaxed">
                    {option.description}
                  </p>
                  
                  <Button
                    className="w-full gradient-primary hover:opacity-90 group-hover:scale-105 transition-transform duration-300"
                    onClick={() => handleOptionSelect(option.action)}
                    disabled={submitting && option.action === "skip"}
                  >
                    {option.action === "skip" ? (submitting ? "Saving..." : "Continue →") : option.action === "external" ? (
                      <span className="flex items-center gap-2">
                        Open Tool <ExternalLink className="w-4 h-4" />
                      </span>
                    ) : "View Tutorials →"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {showTutorials && (
            <Card className="bg-white border border-border p-8 animate-fade-in border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Store Creation Tutorials</h2>
                  <p className="text-sm text-muted-foreground">Step-by-step guide to building your store</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {tutorials.map((tutorial, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/30 hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover-lift border border-transparent hover:border-primary/20"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <span className="text-primary font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-grow pt-1">
                      <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                        {tutorial.title}
                      </span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
              
              <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground mb-1">Pro Tip</p>
                    <p className="text-sm text-muted-foreground">
                      Take your time with each step. Once you've created your store, return here and select "I Already Have a Store" to continue your journey.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateStore;
