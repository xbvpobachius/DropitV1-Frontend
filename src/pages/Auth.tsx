import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground">
              Drop<span className="text-primary">It</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isSignUp ? "Create your account" : "Welcome back"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-border"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Sign up" : "Sign in"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Login with Google
          </Button>

          <p className="text-center text-sm mt-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </p>

          {isSignUp && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              By signing up, you agree to our Terms and Privacy Policy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
