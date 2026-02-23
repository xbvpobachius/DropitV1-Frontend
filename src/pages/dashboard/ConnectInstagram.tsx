import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Youtube, CheckCircle2, ShieldCheck, Info, AlertCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { apiFetch } from "@/lib/api";

interface ChannelItem {
  id: string;
  platform: string;
  post_connect_completed?: boolean;
  scheduling_starts_at?: string | null;
}

const ConnectInstagram = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { progress, refetch } = useOnboardingFlow();
  const [isConnected, setIsConnected] = useState(false);
  const [showPostConnect, setShowPostConnect] = useState(false);
  const [channelInfo, setChannelInfo] = useState<{ post_connect_completed: boolean; scheduling_starts_at: string | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isNewChannel, setIsNewChannel] = useState<boolean | null>(null);
  const [includeWarmup, setIncludeWarmup] = useState(false);

  const justConnected = searchParams.get("youtube_connected") === "1";
  const channelTitle = searchParams.get("channel_title");

  // Fetch channel to check post_connect_completed
  useEffect(() => {
    if (!isConnected && !justConnected) return;
    apiFetch<ChannelItem[]>("/channels")
      .then((channels) => {
        const yt = channels.find((c) => c.platform === "youtube");
        if (yt) {
          setChannelInfo({
            post_connect_completed: yt.post_connect_completed ?? true,
            scheduling_starts_at: yt.scheduling_starts_at ?? null,
          });
        }
      })
      .catch(() => setChannelInfo(null));
  }, [isConnected, justConnected]);

  // Handle redirect from OAuth callback (youtube_connected=1)
  useEffect(() => {
    if (justConnected) {
      refetch();
      setIsConnected(true);
      setShowPostConnect(true);
      toast({
        title: "YouTube connected successfully",
        description: channelTitle ? `"${decodeURIComponent(channelTitle)}" connected.` : "Channel connected.",
      });
    }
  }, [justConnected, channelTitle, refetch, toast]);

  // If channel already has post_connect_completed, skip questionnaire and go to calendar
  useEffect(() => {
    if (justConnected && channelInfo?.post_connect_completed) {
      setShowPostConnect(false);
      navigate("/dashboard/calendar", { replace: true, state: { fromPreviousStep: true } });
    }
  }, [justConnected, channelInfo?.post_connect_completed, navigate]);

  // If the user already connected YouTube (visited page without callback), show connected state.
  useEffect(() => {
    if (progress?.youtube_connected && !justConnected) setIsConnected(true);
  }, [progress?.youtube_connected, justConnected]);

  const handlePostConnectSubmit = async () => {
    if (isNewChannel === null) {
      toast({
        title: "Please answer",
        description: "Select whether this is a new channel or not.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch<{ ok: boolean; scheduling_starts_at: string }>("/auth/youtube/post-connect-settings", {
        method: "POST",
        body: JSON.stringify({
          is_new_channel: isNewChannel,
          include_warmup_day: isNewChannel ? includeWarmup : undefined,
        }),
      });
      setShowPostConnect(false);
      refetch();
      toast({
        title: "Settings saved",
        description: "Automatic scheduling will start on the date indicated.",
      });
      navigate("/dashboard/calendar", { replace: true, state: { fromPreviousStep: true } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save settings";
      toast({ title: "Error", description: msg, variant: "destructive" });
      setSubmitting(false);
    }
  };

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

  const daysUntilScheduling = isNewChannel && includeWarmup ? 3 : 2;

  return (
    <ProtectedRoute requiredStep="/dashboard/connect-youtube">
      <div className="p-8 pt-24 max-w-3xl mx-auto space-y-8 bg-blue-50/30 min-h-screen">
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

        {/* Post-connect questionnaire (shown right after OAuth callback) */}
        {isConnected && showPostConnect ? (
          <Card className="bg-white border border-border p-8">
            <div className="flex items-start gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-bold mb-2">Is this a new channel?</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  The first 2 days after connecting, you must publish manually. Automatic scheduling will start after that period.
                </p>
                <div className="flex gap-3 mb-6">
                  <Button
                    variant={isNewChannel === true ? "default" : "outline"}
                    onClick={() => setIsNewChannel(true)}
                  >
                    Yes, it&apos;s new
                  </Button>
                  <Button
                    variant={isNewChannel === false ? "default" : "outline"}
                    onClick={() => {
                      setIsNewChannel(false);
                      setIncludeWarmup(false);
                    }}
                  >
                    No, it&apos;s existing
                  </Button>
                </div>
                {isNewChannel === true && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border mb-6">
                    <p className="text-sm font-medium mb-2">
                      If the channel was created today, warm it up by watching videos for 30 minutes before publishing.
                    </p>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeWarmup}
                        onChange={(e) => setIncludeWarmup(e.target.checked)}
                        className="rounded"
                      />
                      Include warmup day (add 1 extra day before auto-scheduling)
                    </Label>
                  </div>
                )}
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>First 2 days: publish manually (no automatic publishing)</li>
                    {isNewChannel && includeWarmup && (
                      <li>If channel is new and created today: warm it up (watch videos 30 min)</li>
                    )}
                    <li>
                      After {daysUntilScheduling} days: automatic scheduling will begin
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handlePostConnectSubmit}
              disabled={submitting || isNewChannel === null}
            >
              {submitting ? "Saving..." : "Continue to Dashboard"}
            </Button>
          </Card>
        ) : isConnected && !showPostConnect ? (
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
