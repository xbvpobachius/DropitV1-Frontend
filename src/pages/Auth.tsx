import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Shield, Star } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setIsSignUp(searchParams.get("mode") === "signup");
  }, [searchParams]);

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        const loginData = await apiFetch<{ access_token: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem("access_token", loginData.access_token);
        localStorage.setItem("user_email", email);
        window.dispatchEvent(new Event("dropit-auth-change"));
        toast({ title: "Success!", description: "Account created. You're now logged in." });
        navigate("/dashboard");
      } else {
        const data = await apiFetch<{ access_token: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_email", email);
        window.dispatchEvent(new Event("dropit-auth-change"));
        toast({ title: "Welcome back!", description: "Successfully signed in." });
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast({
      title: "Not available",
      description: "Google sign-in coming soon. Use email and password.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute inset-0 bg-radial-blue" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-radial-blue-bottom" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-[15%] w-72 h-72 rounded-full bg-primary/5 blur-[100px] animate-float" />
      <div className="absolute bottom-32 right-[10%] w-96 h-96 rounded-full bg-primary/8 blur-[120px] animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[80px]" />

      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center border-r border-border/50">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative max-w-md px-12"
        >
          <Link to="/" className="font-display font-bold text-2xl text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center glow-sm">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span>Drop<span className="text-primary">It</span></span>
          </Link>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-5xl font-bold mt-14 leading-tight"
          >
            Finally,{" "}
            <span className="text-gradient">structure</span>{" "}
            for your Shorts workflow.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-muted-foreground mt-6 leading-relaxed text-base"
          >
            Upload, schedule, and publish — all on autopilot.
            Trusted by 10,000+ creators worldwide.
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {[
                  "bg-gradient-to-br from-primary/40 to-primary/20",
                  "bg-gradient-to-br from-blue-400/30 to-blue-500/20",
                  "bg-gradient-to-br from-cyan-400/30 to-cyan-500/20",
                  "bg-gradient-to-br from-sky-400/30 to-sky-500/20",
                ].map((bg, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${bg} border-2 border-background flex items-center justify-center`}>
                    <span className="text-[10px] font-bold text-foreground/60">
                      {["A", "M", "K", "J"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">10,000+</span> creators
              </p>
            </div>

            <div className="flex items-center gap-6 pt-2">
              {[
                { icon: Shield, text: "Enterprise security" },
                { icon: Star, text: "4.9/5 rating" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <item.icon className="h-3.5 w-3.5 text-primary/70" />
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Decorative card preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-12 p-4 rounded-xl glass border-glow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">Live Dashboard Preview</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Scheduled", val: "24" },
                { label: "Published", val: "142" },
                { label: "Views", val: "12.4K" },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="font-display font-bold text-sm mt-0.5">{s.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[420px]"
        >
          <div className="lg:hidden mb-10">
            <Link to="/" className="font-display font-bold text-xl text-foreground flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Zap className="h-4.5 w-4.5 text-primary" />
              </div>
              <span>Drop<span className="text-primary">It</span></span>
            </Link>
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            {isSignUp ? "Start your free trial — no credit card needed" : "Sign in to your account to continue"}
          </p>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl mb-7 hover-glow text-sm font-medium"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/70" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-4 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-muted/30 border-border/70 focus:border-primary/50 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-muted/30 border-border/70 focus:border-primary/50 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-medium glow hover:glow transition-all duration-300"
            >
              {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-7">
            {isSignUp ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up free"}
            </button>
          </p>

          {isSignUp && (
            <p className="text-[11px] text-center text-muted-foreground/60 mt-4">
              By creating an account, you agree to our Terms and Privacy Policy.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
