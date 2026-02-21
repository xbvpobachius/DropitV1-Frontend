import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, Video, Package, TrendingUp, Calendar as CalendarIcon, Eye, Trash2, AlertTriangle, CheckCircle2, Youtube } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ApiStatusIndicator } from "@/components/ApiStatusIndicator";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const useCountdown = (preferredHourUtc: number | null) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [scheduledLabel, setScheduledLabel] = useState<string>("");

  useEffect(() => {
    if (preferredHourUtc == null) {
      setTimeLeft("");
      setScheduledLabel("");
      return;
    }
    const getTarget = () => {
      const now = new Date();
      const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), preferredHourUtc, 0, 0, 0));
      if (now >= target) {
        target.setUTCDate(target.getUTCDate() + 1);
      }
      return target;
    };

    const update = () => {
      const now = new Date();
      const target = getTarget();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft("");
        setScheduledLabel("");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes.toString().padStart(2, "0")}m`);
      setScheduledLabel(`${String(preferredHourUtc).padStart(2, "0")}:00 UTC`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [preferredHourUtc]);

  return { timeLeft, scheduledLabel };
};

const RECONNECT_TTL_DAYS = 7;

function formatDurationShort(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / (1000 * 60)));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${String(hours).padStart(2, "0")}h`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${minutes}m`;
}

const useReconnectCountdown = (connectedAtIso: string | null | undefined) => {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    if (!connectedAtIso) {
      setLabel("");
      return;
    }
    const connectedAtMs = Date.parse(connectedAtIso);
    if (Number.isNaN(connectedAtMs)) {
      setLabel("");
      return;
    }
    const expiresAtMs = connectedAtMs + RECONNECT_TTL_DAYS * 24 * 60 * 60 * 1000;

    const update = () => {
      const now = Date.now();
      const diff = expiresAtMs - now;
      if (diff <= 0) {
        setLabel("Reconnect required");
        return;
      }
      setLabel(`Reconnect in ${formatDurationShort(diff)}`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [connectedAtIso]);

  return label;
};

const Overview = () => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [publishingStatus, setPublishingStatus] = useState<{
    youtube_channel_title?: string | null;
    youtube_channel_status?: string | null;
    youtube_connected_at?: string | null;
    needs_reconnect: boolean;
    published_today: number;
    daily_video_limit: number;
    preferred_upload_hour_utc?: number | null;
  } | null>(null);
  const [publishingLogs, setPublishingLogs] = useState<Array<{
    id: string;
    video_filename: string;
    status: string;
    published_at: string;
    error_message?: string | null;
  }>>([]);
  const [reconnecting, setReconnecting] = useState(false);
  const [savingHour, setSavingHour] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { timeLeft: countdown, scheduledLabel } = useCountdown(publishingStatus?.preferred_upload_hour_utc ?? null);
  const reconnectCountdown = useReconnectCountdown(publishingStatus?.youtube_connected_at);

  useEffect(() => {
    const loadPublishing = async () => {
      if (!localStorage.getItem("access_token")) return;

      try {
        const status = await apiFetch<{
          youtube_channel_title?: string | null;
          youtube_channel_status?: string | null;
          youtube_connected_at?: string | null;
          needs_reconnect: boolean;
          published_today: number;
          daily_video_limit: number;
          preferred_upload_hour_utc?: number | null;
        }>("/publishing/status");
        setPublishingStatus(status);
      } catch {
        setPublishingStatus(null);
      }

      try {
        const logs = await apiFetch<Array<{
          id: string;
          video_filename: string;
          status: string;
          published_at: string;
          error_message?: string | null;
        }>>("/publishing/logs?limit=10");
        setPublishingLogs(logs || []);

        const lastFailed = (logs || []).find((l) => l.status === "failed");
        if (lastFailed?.published_at) {
          const ts = Date.parse(lastFailed.published_at);
          const key = "dropit_last_failed_pub_ts";
          const seen = Number(sessionStorage.getItem(key) || "0");
          if (!Number.isNaN(ts) && ts > seen) {
            sessionStorage.setItem(key, String(ts));
            toast({
              title: "Upload failed",
              description: lastFailed.error_message || "A scheduled upload failed. Please check your connection.",
              variant: "destructive",
            });
          }
        }
      } catch {
        setPublishingLogs([]);
      }
    };

    loadPublishing();
  }, [toast]);

  const handleUploadHourChange = async (hourUtc: string) => {
    const value = hourUtc === "none" ? null : parseInt(hourUtc, 10);
    setSavingHour(true);
    try {
      const updated = await apiFetch<{
        preferred_upload_hour_utc?: number | null;
        published_today: number;
        daily_video_limit: number;
        needs_reconnect: boolean;
        youtube_channel_title?: string | null;
        youtube_channel_status?: string | null;
      }>("/publishing/settings", {
        method: "PATCH",
        body: JSON.stringify({ preferred_upload_hour_utc: value }),
      });
      setPublishingStatus((prev) => (prev ? { ...prev, preferred_upload_hour_utc: updated.preferred_upload_hour_utc ?? null } : null));
      toast({
        title: "Time saved",
        description: value != null
          ? `Shorts will publish daily at ${String(value).padStart(2, "0")}:00 UTC.`
          : "Publish time cleared.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Could not save publish time",
        variant: "destructive",
      });
    } finally {
      setSavingHour(false);
    }
  };

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      const data = await apiFetch<{ auth_url: string }>("/auth/youtube/login");
      if (data.auth_url) {
        window.location.href = data.auth_url;
        return;
      }
      throw new Error("No auth URL returned");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not reconnect";
      toast({ title: "Error", description: message, variant: "destructive" });
      setReconnecting(false);
    }
  };

  const handleRemoveProduct = async () => {
    setIsRemoving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "Could not authenticate", variant: "destructive" });
        return;
      }
      const { error } = await supabase
        .from("user_progress")
        .update({
          product_selected: false,
          store_created: false,
          instagram_connected: false,
          calendar_viewed: false,
          products_created: 0,
          stores_created: 0,
          onboarding_completed: false,
        })
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error resetting progress:", error);
        toast({ title: "Error", description: "Could not remove content", variant: "destructive" });
        return;
      }
      toast({ title: "Removed from queue", description: "You can add new content in the Content Calendar." });
      setTimeout(() => { navigate("/dashboard/select-product"); }, 1000);
    } catch (error) {
        console.error("Error removing content:", error);
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsRemoving(false);
    }
  };

  const scheduledVideos = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    hasVideo: i % 3 !== 0,
    time: "18:00",
    thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=200`,
    title: `Short #${i + 1}`,
  }));

  const getDayName = (day: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[day % 7];
  };

  // TODO: wire to real API – null = empty state
  const selectedProduct: { name: string; image: string } | null = {
    name: "Wireless Earbuds Pro",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
  };

  return (
    <ProtectedRoute requiredStep="/dashboard/overview">
      <div className="p-8 pt-24 max-w-7xl mx-auto bg-blue-50/30 min-h-screen">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1.5">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">Content workflow and publishing status</p>
          </div>
          <ApiStatusIndicator />
        </div>

        {/* Empty state: no content selected */}
        {!selectedProduct && (
          <Card className="mb-8 overflow-hidden border border-dashed border-border bg-white">
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-5">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-1.5">No content in queue</h2>
              <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
                Choose a product in Content Calendar to start publishing Shorts to your YouTube channel.
              </p>
              <Button asChild variant="default">
                <Link to="/dashboard/calendar">Open Content Calendar</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Active Content Banner */}
        {selectedProduct && (
        <Card className="mb-8 overflow-hidden border border-border bg-white shadow-sm">
          <div className="flex items-center gap-6 p-6">
            <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-border/50">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-2 text-xs font-medium">Publishing</Badge>
              <h2 className="text-2xl font-semibold mb-1">{selectedProduct.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-sm text-muted-foreground">
                <span>
                  Channel:{" "}
                  <span className="text-foreground font-medium">
                    {publishingStatus?.youtube_channel_title || "YouTube"}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      publishingStatus?.needs_reconnect ? "bg-amber-500" : "bg-primary"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      publishingStatus?.needs_reconnect ? "text-amber-600 dark:text-amber-500" : "text-primary"
                    }`}
                  >
                    {publishingStatus?.needs_reconnect ? "Reconnect required" : "Connected"}
                  </span>
                </span>
                {publishingStatus?.needs_reconnect && (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-500/40 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10"
                      onClick={handleReconnect}
                      disabled={reconnecting}
                    >
                      {reconnecting ? "Redirecting…" : "Reconnect YouTube"}
                    </Button>
                    {reconnectCountdown ? (
                      <span className="text-xs text-muted-foreground">
                        {reconnectCountdown}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
              {publishingStatus && (
                <div className="text-xs text-muted-foreground mb-3">
                  Published today:{" "}
                  <span className="text-foreground font-medium">
                    {publishingStatus.published_today}
                  </span>{" "}
                  / {publishingStatus.daily_video_limit}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-sm text-muted-foreground">
                  Daily publish time ({publishingStatus?.daily_video_limit ?? 1} Short/s per day):
                </span>
                <Select
                  value={
                    publishingStatus?.preferred_upload_hour_utc != null
                      ? String(publishingStatus.preferred_upload_hour_utc)
                      : "none"
                  }
                  onValueChange={handleUploadHourChange}
                  disabled={savingHour}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select time (UTC)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not set</SelectItem>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {String(i).padStart(2, "0")}:00 UTC
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {publishingStatus?.preferred_upload_hour_utc != null && (
                  <span className="text-xs text-muted-foreground">
                    {publishingStatus.daily_video_limit} Short(s)/day at {String(publishingStatus.preferred_upload_hour_utc).padStart(2, "0")}:00 UTC
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                      </div>
                      <AlertDialogTitle className="text-xl font-semibold">Remove from queue?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                      This will remove <strong>{selectedProduct.name}</strong> from your publishing queue and reset setup. You can add new content anytime in the Content Calendar.
                      <br /><br />
                      <span className="text-destructive/90 font-medium">This cannot be undone.</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveProduct} disabled={isRemoving} className="bg-destructive hover:bg-destructive/90 text-white">
                      {isRemoving ? "Removing…" : "Remove"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
        )}

        {/* Publishing logs */}
        {publishingLogs.length > 0 && (
          <Card className="mb-8 border border-border bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Publish history</CardTitle>
              <CardDescription className="text-sm">Recent automated uploads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {publishingLogs.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground truncate">
                    {l.video_filename || "(pre-check)"}{l.status === "failed" && l.error_message ? ` — ${l.error_message}` : ""}
                  </span>
                  <Badge variant={l.status === "failed" ? "destructive" : "secondary"}>
                    {l.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 border border-border bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Content</span>
              <Package className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div className="text-2xl font-semibold tracking-tight">1</div>
            <p className="text-xs text-muted-foreground mt-1">In queue</p>
          </Card>

          <Card className="p-5 border border-border bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shorts</span>
              <Video className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div className="text-2xl font-semibold tracking-tight">24</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </Card>

          <Card className="p-5 border border-border bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Views</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div className="text-2xl font-semibold tracking-tight">12.4K</div>
            <p className="text-xs text-muted-foreground mt-1">+15% vs last week</p>
          </Card>

          <Card className="p-5 border border-border bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Watch time</span>
              <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div className="text-2xl font-semibold tracking-tight">42h</div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </Card>
        </div>

        {/* Automation */}
        <Card className="mb-8 border border-border bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Youtube className="h-4 w-4 text-muted-foreground" />
              Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${publishingStatus?.needs_reconnect ? "bg-amber-500" : "bg-primary"}`} />
                {publishingStatus?.needs_reconnect ? "YouTube reconnect required" : "YouTube connected"}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Auto publishing
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Next upload scheduled
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Performance */}
          <Card className="border border-border bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Performance
              </CardTitle>
              <CardDescription className="text-sm">Shorts performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. watch time</span>
                  <span className="text-sm font-semibold">1m 42s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">CTR</span>
                  <span className="text-sm font-semibold">4.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New subscribers</span>
                  <span className="text-sm font-semibold text-primary">+127</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-border bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                Recent Shorts
              </CardTitle>
              <CardDescription className="text-sm">Most recent uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/90">Short #24</span>
                  <span className="text-sm font-medium text-primary">1.2K views</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/90">Short #23</span>
                  <span className="text-sm font-medium text-primary">980 views</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/90">Short #22</span>
                  <span className="text-sm font-medium text-primary">1.5K views</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight mb-1">Content calendar</h2>
            <p className="text-muted-foreground text-sm">Your scheduled Shorts for the next 4 weeks</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="p-5 border border-border bg-white">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">This month</div>
              <div className="text-2xl font-semibold tracking-tight">24</div>
              <p className="text-xs text-muted-foreground mt-1">Shorts scheduled</p>
            </Card>
            <Card className="p-5 border border-border bg-white">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Next upload</div>
              <div className="text-2xl font-semibold tracking-tight">
                {publishingStatus?.preferred_upload_hour_utc != null ? countdown || "—" : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {scheduledLabel ? `Today at ${scheduledLabel}` : "Set publish time above"}
              </p>
            </Card>
            <Card className="p-5 border border-border bg-white">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">This week</div>
              <div className="text-2xl font-semibold tracking-tight">12.4K</div>
              <p className="text-xs text-muted-foreground mt-1">Views</p>
            </Card>
          </div>

          <Card className="p-6 border border-border bg-white">
            <div className="grid grid-cols-7 gap-4">
              {scheduledVideos.slice(0, 28).map((video) => (
                <Dialog key={video.day}>
                  <DialogTrigger asChild>
                    <div
                      className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        video.hasVideo
                          ? "hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-white"
                          : "bg-muted/80"
                      }`}
                      onMouseEnter={() => setHoveredDay(video.day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      {video.hasVideo ? (
                        <div className="relative w-full h-full group">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-1 left-1 right-1">
                              <Badge variant="secondary" className="text-xs px-1 py-0 mb-1">{video.time}</Badge>
                            </div>
                          </div>
                          <div className="absolute top-1 left-1">
                            <Badge variant="default" className="text-xs px-1.5 py-0">{video.day}</Badge>
                          </div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Video className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-muted-foreground/50">{video.day}</span>
                          <span className="text-xs text-muted-foreground/50">{getDayName(video.day)}</span>
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  {video.hasVideo && (
                    <DialogContent className="bg-white border-border">
                      <DialogHeader>
                        <DialogTitle>{video.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Day {video.day} · {video.time} UTC</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" /> Preview
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <CalendarIcon className="w-4 h-4 mr-2" /> Reschedule
                          </Button>
                          <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Overview;
