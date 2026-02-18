import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, Eye, Trash2, Calendar as CalendarIcon, Youtube, RefreshCw } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

interface ChannelInfo {
  id: string;
  platform: string;
  status: string;
  channel_title: string | null;
  youtube_channel_id: string | null;
}

const ContentCalendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { progress } = useOnboardingFlow();
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [youtubeChannel, setYoutubeChannel] = useState<ChannelInfo | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const loadChannels = async () => {
      if (!localStorage.getItem("access_token")) return;
      try {
        const channels = await apiFetch<ChannelInfo[]>("/channels");
        const yt = channels?.find((c) => c.platform === "youtube") ?? null;
        setYoutubeChannel(yt);
      } catch {
        setYoutubeChannel(null);
      }
    };
    loadChannels();
  }, []);

  useEffect(() => {
    // Mark calendar as viewed and complete onboarding
    const markViewed = async () => {
      if (progress && !progress.calendar_viewed) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await supabase
          .from("user_progress")
          .update({ 
            calendar_viewed: true,
            onboarding_completed: true 
          })
          .eq("user_id", session.user.id);
        
        // Navigate to overview after marking as completed
        setTimeout(() => {
          navigate("/dashboard/overview");
        }, 2000);
      }
    };
    markViewed();
  }, [progress, navigate]);

  const stats = [
    { label: "Videos this month", value: "24" },
    { label: "Next upload", value: "Today, 6:00 PM" },
    { label: "Views this week", value: "12.4K" },
  ];

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
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <ProtectedRoute requiredStep="/dashboard/calendar">
      <div className="p-8 pt-32 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Content Calendar</h1>
          <p className="text-muted-foreground">Manage your automated video schedule</p>
        </div>

        {youtubeChannel && (
          <Card className="card-premium p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Youtube className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connected channel</p>
                <p className="font-semibold">{youtubeChannel.channel_title || "YouTube"}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              disabled={reconnecting}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {reconnecting ? "Redirecting to Google…" : "Reconnect"}
            </Button>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="card-premium p-6">
              <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
            </Card>
          ))}
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
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-1 left-1 right-1">
                            <Badge variant="secondary" className="text-xs px-1 py-0 mb-1">
                              {video.time}
                            </Badge>
                          </div>
                        </div>
                        <div className="absolute top-1 left-1">
                          <Badge variant="default" className="text-xs px-1.5 py-0">
                            {video.day}
                          </Badge>
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
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Scheduled for Day {video.day} at {video.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Reschedule
                        </Button>
                        <Button variant="destructive" className="flex-1">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
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
    </ProtectedRoute>
  );
};

export default ContentCalendar;
