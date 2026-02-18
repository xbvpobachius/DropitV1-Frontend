import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProductSlider3D } from "@/components/ProductSlider3D";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Youtube,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Info,
  Rocket,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const TOTAL_STEPS = 4;

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  // YouTube connect state
  const [refreshToken, setRefreshToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [loading, setLoading] = useState(false);
  const [ytConnected, setYtConnected] = useState(false);

  const products = [
    { id: 1, name: "Smart LED Sunset Lamp", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", purchasePrice: 8.5, sellingPrice: 29.99, profit: 253 },
    { id: 2, name: "Portable Blender Pro", image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop", purchasePrice: 7.2, sellingPrice: 24.99, profit: 247 },
    { id: 3, name: "Wireless Earbuds Mini", image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop", purchasePrice: 5.0, sellingPrice: 19.99, profit: 300 },
    { id: 4, name: "Posture Corrector Belt", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop", purchasePrice: 4.5, sellingPrice: 15.99, profit: 255 },
  ];

  const guideSteps = [
    { number: 1, title: "Create a Google Cloud project" },
    { number: 2, title: "Enable YouTube Data API v3" },
    { number: 3, title: "Create OAuth credentials" },
    { number: 4, title: "Generate refresh token" },
  ];

  const handleSkip = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/dashboard/overview");
  };

  const handleFinish = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/dashboard/overview");
  };

  const handleConnectClick = () => {
    if (!refreshToken.trim() || !clientId.trim() || !clientSecret.trim()) {
      toast({ title: "Missing credentials", description: "Please fill in all three fields.", variant: "destructive" });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmConnect = () => {
    setLoading(true);
    // Simulate connection (frontend-only)
    setTimeout(() => {
      setShowConfirmModal(false);
      setYtConnected(true);
      setLoading(false);
      toast({ title: "Channel connected!", description: "Your YouTube credentials have been saved." });
      // Auto-advance to step 4
      setStep(4);
    }, 1200);
  };

  const progressValue = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Step {step} of {TOTAL_STEPS}
          </span>
          <Progress value={progressValue} className="h-2 flex-1" />
        </div>
      </div>

      <div className="pt-20 pb-16 px-6 max-w-3xl mx-auto">
        {/* Step 1 – Welcome */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-8 glow-strong">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Welcome to DropIt</h1>
            <p className="text-muted-foreground text-lg mb-10 max-w-md">
              Let's set up your automated YouTube system in under 2 minutes.
            </p>
            <Button
              size="lg"
              className="gradient-primary hover:opacity-90 text-lg py-7 px-16 rounded-xl font-semibold glow-strong mb-4"
              onClick={() => setStep(2)}
            >
              Start Setup
            </Button>
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 2 – Select Product */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold mb-3 text-primary">Select Your Product</h1>
              <p className="text-muted-foreground text-lg">Choose from our curated collection</p>
            </div>

            <ProductSlider3D
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
            />

            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="gradient-primary hover:opacity-90 text-lg py-7 px-16 rounded-xl font-semibold glow-strong disabled:opacity-40"
                disabled={!selectedProduct}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 – Connect YouTube */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center">
                  <Youtube className="w-10 h-10 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-3">Connect Your YouTube Channel</h1>
              <p className="text-muted-foreground text-lg">
                To publish videos automatically, Dropit needs secure API access to your YouTube account.
              </p>
            </div>

            {/* Why Google Cloud card */}
            <Card className="card-premium p-6 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Why Google Cloud?</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    YouTube does not allow third-party tools to upload videos without OAuth credentials.
                    For security and compliance, each user must create their own Google Cloud credentials.
                  </p>
                  <p className="text-sm font-medium text-foreground mb-2">This ensures:</p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />Full ownership of your channel</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />No shared API keys</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />Maximum security</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />Compliance with YouTube policies</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Setup Guide */}
            <Card className="card-premium overflow-hidden">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="w-full flex items-center justify-between p-6 hover:bg-secondary/50 transition-colors"
              >
                <span className="text-lg font-bold">Show setup guide</span>
                {showGuide ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
              {showGuide && (
                <div className="px-6 pb-6 space-y-4">
                  {guideSteps.map((s) => (
                    <div key={s.number} className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{s.number}</span>
                      </div>
                      <span className="font-medium text-foreground">{s.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Credentials Form */}
            <Card className="card-premium p-8">
              <h3 className="text-xl font-bold mb-6">Enter your credentials</h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="ob-refreshToken">Refresh Token</Label>
                  <Input id="ob-refreshToken" type="password" placeholder="Enter your refresh token" value={refreshToken} onChange={(e) => setRefreshToken(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-clientId">Client ID</Label>
                  <Input id="ob-clientId" placeholder="Enter your client ID" value={clientId} onChange={(e) => setClientId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-clientSecret">Client Secret</Label>
                  <Input id="ob-clientSecret" type="password" placeholder="Enter your client secret" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} />
                </div>
                <Button className="w-full gradient-primary hover:opacity-90 text-lg py-6 glow-strong" onClick={handleConnectClick}>
                  <Youtube className="w-5 h-5 mr-2" />
                  Connect Channel
                </Button>
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Your credentials are encrypted and only used to publish videos on your behalf.
                </p>
              </div>
            </Card>

            {/* Confirmation Modal */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">Confirm Channel Setup</DialogTitle>
                  <DialogDescription>You're about to connect your YouTube channel to Dropit.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="ob-channelName">Channel Display Name</Label>
                    <Input id="ob-channelName" placeholder="My YouTube Channel" value={channelName} onChange={(e) => setChannelName(e.target.value)} />
                    <p className="text-xs text-muted-foreground">This name will appear in your Dropit dashboard.</p>
                  </div>
                  <Card className="p-4 bg-secondary/50 border-primary/10">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />YouTube API connected</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />Credentials verified</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />Automatic publishing enabled</li>
                    </ul>
                  </Card>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={loading}>Cancel</Button>
                  <Button className="gradient-primary hover:opacity-90 glow-strong" onClick={handleConfirmConnect} disabled={loading}>
                    {loading ? "Connecting..." : "Confirm & Connect"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Step 4 – Setup Complete */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-8 glow-strong">
              <Rocket className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold mb-4">You're Ready 🚀</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Your system is now connected and ready to publish.
            </p>
            <Card className="card-premium p-6 mb-10 text-left">
              <ul className="space-y-3 text-base">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />YouTube connected</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Automatic publishing enabled</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />AI video generation active</li>
              </ul>
            </Card>
            <Button
              size="lg"
              className="gradient-primary hover:opacity-90 text-lg py-7 px-16 rounded-xl font-semibold glow-strong"
              onClick={handleFinish}
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
