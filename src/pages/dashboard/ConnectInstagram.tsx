import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Youtube, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { apiFetch } from "@/lib/api";

const ConnectInstagram = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { progress, refetch } = useOnboardingFlow();
  const [isConnected, setIsConnected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  // Handle redirect from OAuth callback (youtube_connected=1)
  useEffect(() => {
    const connected = searchParams.get("youtube_connected");
    const channelTitle = searchParams.get("channel_title");
    if (connected === "1") {
      refetch();
      setIsConnected(true);
      toast({
        title: "YouTube connected successfully",
        description: channelTitle ? `"${channelTitle}" is ready for automated publishing.` : "Your channel is ready for automated publishing.",
      });
      navigate("/dashboard/calendar", { replace: true, state: { fromPreviousStep: true } });
    }
  }, [searchParams, refetch, toast, navigate]);

  // If the user already connected YouTube, show connected state.
  useEffect(() => {
    if (progress?.youtube_connected) setIsConnected(true);
  }, [progress?.youtube_connected]);

  /** First-time connect: save client_id/secret and redirect to Google */
  const handleConnectWithGoogle = async () => {
    const cId = clientId.trim();
    const cSecret = clientSecret.trim();
    if (!cId || !cSecret) {
      toast({
        title: "Missing credentials",
        description: "Please enter your Client ID and Client Secret.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiFetch<{ auth_url: string }>("/auth/youtube/login", {
        method: "POST",
        body: JSON.stringify({ client_id: cId, client_secret: cSecret }),
      });
      if (data.auth_url) {
        window.location.href = data.auth_url;
        return;
      }
      throw new Error("No auth URL returned");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not start YouTube connection";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  /** Reconnect: use stored credentials, no form – just redirect to Google */
  const handleReconnect = async () => {
    setSubmitting(true);
    try {
      const data = await apiFetch<{ auth_url: string }>("/auth/youtube/login");
      if (data.auth_url) {
        window.location.href = data.auth_url;
        return;
      }
      throw new Error("No auth URL returned");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not start reconnect";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredStep="/dashboard/connect-youtube">
      <div className="p-8 pt-24 max-w-3xl mx-auto space-y-8 bg-muted/30 min-h-screen">
        {/* Header */}
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center">
              <Youtube className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3">Connect Your YouTube Channel</h1>
          <p className="text-muted-foreground text-lg">
            To publish videos automatically, Dropit needs secure API access to your YouTube account.
          </p>
        </div>

        {isConnected ? (
          <Card className="bg-white border border-border p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="w-16 h-16 text-primary" />
              <h2 className="text-2xl font-bold">YouTube Channel Connected</h2>
              <p className="text-muted-foreground">Your channel is ready for automated publishing.</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/dashboard/calendar", { state: { fromPreviousStep: true } })}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="text-lg py-6 px-8"
                  onClick={handleReconnect}
                  disabled={submitting}
                >
                  {submitting ? "Redirecting to Google…" : "Reconnect"}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Info card */}
            <Card className="bg-white border border-border p-6 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Secure OAuth connection</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Enter your Google OAuth Client ID and Client Secret, then sign in with Google to connect your YouTube channel.
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />Official Google OAuth 2.0</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />Read-only & upload access</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />You can revoke access anytime in Google</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* OAuth Connect Button */}
            <Card className="bg-white border border-border p-8">
              <h3 className="text-xl font-bold mb-6">Connect with Google</h3>
              <p className="text-muted-foreground mb-6">
                Provide your credentials below and click connect. You will be redirected to Google to authorize Dropit.
              </p>
              <div className="space-y-5 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    placeholder="Enter your client ID"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="Enter your client secret"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleConnectWithGoogle}
                disabled={submitting}
              >
                <Youtube className="w-5 h-5 mr-2" />
                {submitting ? "Redirecting to Google..." : "Connect with YouTube"}
              </Button>
            </Card>
          </>
        )}

      </div>
    </ProtectedRoute>
  );
};

export default ConnectInstagram;
