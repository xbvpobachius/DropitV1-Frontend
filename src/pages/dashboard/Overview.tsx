import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, Video, Package, TrendingUp, Calendar as CalendarIcon, Eye, Trash2, AlertTriangle, CheckCircle2, Youtube } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ApiStatusIndicator } from "@/components/ApiStatusIndicator";
import { useNavigate } from "react-router-dom";
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
        setLabel("Mandatory reconnect now");
        return;
      }
      setLabel(`Mandatory reconnect in ${formatDurationShort(diff)}`);
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
        title: "Hora desada",
        description: value != null
          ? `Els vídeos es penjaran cada dia a les ${String(value).padStart(2, "0")}:00 UTC.`
          : "Hora de pujada esborrada.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "No s'ha pogut desar la hora",
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
        toast({ title: "Error", description: "Could not remove product", variant: "destructive" });
        return;
      }
      toast({ title: "Product Removed", description: "Your progress has been reset. Starting over..." });
      setTimeout(() => { navigate("/dashboard/select-product"); }, 1000);
    } catch (error) {
      console.error("Error removing product:", error);
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsRemoving(false);
    }
  };

  const scheduledVideos = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    hasVideo: i % 3 !== 0,
    time: "18:00",
    thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=200`,
    title: `Product Showcase ${i + 1}`,
  }));

  const getDayName = (day: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[day % 7];
  };

  const selectedProduct = {
    name: "Wireless Earbuds Pro",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
    purchasePrice: 12.99,
    sellingPrice: 49.99,
    profit: 285,
  };

  return (
    <ProtectedRoute requiredStep="/dashboard/overview">
      <div className="p-8 pt-32 max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Main <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">Business metrics and statistics</p>
          </div>
          <ApiStatusIndicator />
        </div>

        {/* Selected Product Banner */}
        <Card className="card-premium mb-8 overflow-hidden border-2 border-primary/30 glow-primary">
          <div className="flex items-center gap-6 p-6">
            <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-primary/20 text-primary border-primary/40">Active Product</Badge>
              <h2 className="text-3xl font-bold mb-1">{selectedProduct.name}</h2>
              {/* Connected Channel Info */}
              <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-muted-foreground">
                <span>
                  Connected Channel:{" "}
                  <span className="text-foreground font-medium">
                    {publishingStatus?.youtube_channel_title || "YouTube"}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  Status:{" "}
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      publishingStatus?.needs_reconnect ? "bg-destructive" : "bg-primary"
                    }`}
                  />{" "}
                  <span
                    className={`font-medium ${
                      publishingStatus?.needs_reconnect ? "text-destructive" : "text-primary"
                    }`}
                  >
                    {publishingStatus?.needs_reconnect ? "Reconnect required" : "Active"}
                  </span>
                </span>
                {publishingStatus?.needs_reconnect && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleReconnect}
                      disabled={reconnecting}
                    >
                      {reconnecting ? "Redirecting…" : "Reconnect"}
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
                  Publishing today:{" "}
                  <span className="text-foreground font-medium">
                    {publishingStatus.published_today}
                  </span>{" "}
                  / {publishingStatus.daily_video_limit}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-sm text-muted-foreground">Hora de pujada:</span>
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
                    <SelectValue placeholder="Tria l'hora (UTC)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No configurada</SelectItem>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {String(i).padStart(2, "0")}:00 UTC
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {publishingStatus?.preferred_upload_hour_utc != null && (
                  <span className="text-xs text-muted-foreground">
                    Els vídeos es penjaran cada dia a aquesta hora (UTC).
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Cost</div>
                  <div className="text-xl font-bold text-destructive">${selectedProduct.purchasePrice.toFixed(2)}</div>
                </div>
                <div className="text-2xl text-primary">→</div>
                <div>
                  <div className="text-sm text-muted-foreground">Selling Price</div>
                  <div className="text-2xl font-bold text-primary">${selectedProduct.sellingPrice.toFixed(2)}</div>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-gradient-primary text-white text-lg px-4 py-2">+{selectedProduct.profit}% Profit</Badge>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Product
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                      </div>
                      <AlertDialogTitle className="text-2xl">Remove Product?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base leading-relaxed">
                      This will remove <strong>{selectedProduct.name}</strong> and reset all your progress.
                      You'll need to start over by selecting a new product and going through the setup process again.
                      <br /><br />
                      <span className="text-destructive font-semibold">This action cannot be undone.</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveProduct} disabled={isRemoving} className="bg-destructive hover:bg-destructive/90 text-white">
                      {isRemoving ? "Removing..." : "Yes, Remove Product"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>

        {/* Publishing logs (minimal) */}
        {publishingLogs.length > 0 && (
          <Card className="card-premium mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Recent publishing logs</CardTitle>
              <CardDescription>Latest automatic publication attempts</CardDescription>
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

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1</div>
              <p className="text-xs text-muted-foreground mt-1">+1 this week</p>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Videos Created</CardTitle>
              <Video className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12.4K</div>
              <p className="text-xs text-muted-foreground mt-1">+15% from last week</p>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$2,847</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Automation Status */}
        <Card className="card-premium mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Youtube className="h-4 w-4 text-primary" />
              Automation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> YouTube Connected
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Auto Publishing Active
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Next Upload Scheduled
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Performance */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance
              </CardTitle>
              <CardDescription>Track your channel engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. View Duration</span>
                  <span className="text-sm font-bold text-primary">1m 42s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">CTR</span>
                  <span className="text-sm font-bold">4.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subscriber Growth</span>
                  <span className="text-sm font-bold text-primary">+127</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Recent Videos
              </CardTitle>
              <CardDescription>Your latest content performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Product Showcase #24</span>
                  <span className="text-sm text-primary">1.2K views</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Product Showcase #23</span>
                  <span className="text-sm text-primary">980 views</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Product Showcase #22</span>
                  <span className="text-sm text-primary">1.5K views</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Section */}
        <div className="mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">
              Content <span className="text-primary">Calendar</span>
            </h2>
            <p className="text-muted-foreground">Manage your automated video calendar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="card-premium p-6">
              <div className="text-sm text-muted-foreground mb-1">Videos this month</div>
              <div className="text-3xl font-bold text-primary">24</div>
            </Card>
            <Card className="card-premium p-6">
              <div className="text-sm text-muted-foreground mb-1">Next Upload In</div>
              <div className="text-3xl font-bold text-primary">
                {publishingStatus?.preferred_upload_hour_utc != null ? countdown || "—" : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {scheduledLabel ? `Scheduled for today at ${scheduledLabel}` : "Configura l'hora de pujada a dalt"}
              </p>
            </Card>
            <Card className="card-premium p-6">
              <div className="text-sm text-muted-foreground mb-1">Views this week</div>
              <div className="text-3xl font-bold text-primary">12.4K</div>
            </Card>
          </div>

          <Card className="card-premium p-6">
            <div className="grid grid-cols-7 gap-4">
              {scheduledVideos.slice(0, 28).map((video) => (
                <Dialog key={video.day}>
                  <DialogTrigger asChild>
                    <div
                      className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                        video.hasVideo
                          ? "hover:ring-2 hover:ring-primary hover:glow-primary hover:scale-105"
                          : "bg-secondary/50"
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
                    <DialogContent className="bg-card border-border">
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
                            <span>Scheduled for Day {video.day} at {video.time}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" /> Preview
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <CalendarIcon className="w-4 h-4 mr-2" /> Reschedule
                          </Button>
                          <Button variant="destructive" className="flex-1">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
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
