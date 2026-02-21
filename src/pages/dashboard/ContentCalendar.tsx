import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Clock, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PublishingStatus {
  daily_video_limit: number;
  preferred_upload_hour_utc?: number | null;
  preferred_upload_times_utc?: number[] | null;
}

interface ScheduledVideo {
  id: string;
  scheduled_for: string;
  title: string;
  status: string;
}

interface ScheduledResponse {
  year: number;
  month: number;
  days: Record<number, ScheduledVideo[]>;
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number) => {
  const d = new Date(year, month - 1, 1);
  return (d.getDay() + 6) % 7;
};

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const formatUtcAndSpain = (iso: string) => {
  try {
    const d = new Date(iso);
    const utc = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
    const spain = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Madrid",
    });
    return `${utc} UTC (${spain} Spain)`;
  } catch {
    return "";
  }
};

const ContentCalendar = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [scheduled, setScheduled] = useState<ScheduledResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishingStatus, setPublishingStatus] = useState<PublishingStatus | null>(null);
  const [savingHour, setSavingHour] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<{ id: string; title: string; scheduled_for: string; status: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleHour, setRescheduleHour] = useState(12);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleVideoClick = async (v: ScheduledVideo) => {
    setPreviewVideo({ id: v.id, title: v.title, scheduled_for: v.scheduled_for, status: v.status });
    setPreviewUrl(null);
    setPreviewLoading(true);
    try {
      const res = await apiFetch<{ url: string }>(`/videos/${v.id}/preview-url`);
      setPreviewUrl(res.url);
    } catch (e) {
      toast({
        title: "Cannot preview",
        description: e instanceof Error ? e.message : "Video may have already been published",
        variant: "destructive",
      });
      setPreviewVideo(null);
    } finally {
      setPreviewLoading(false);
    }
    if (v.scheduled_for) {
      const d = new Date(v.scheduled_for);
      setRescheduleDate(d.toISOString().slice(0, 10));
      setRescheduleHour(d.getUTCHours());
    }
  };

  const closePreview = () => {
    setPreviewVideo(null);
    setPreviewUrl(null);
  };

  const canEditVideo = previewVideo && (previewVideo.status === "scheduled" || previewVideo.status === "draft");

  const handleReschedule = async () => {
    if (!previewVideo || !canEditVideo) return;
    setSaving(true);
    try {
      await apiFetch(`/videos/${previewVideo.id}/schedule`, {
        method: "PATCH",
        body: JSON.stringify({
          scheduled_date: rescheduleDate,
          scheduled_hour: rescheduleHour,
        }),
      });
      toast({ title: "Rescheduled", description: "Video has been moved to the new date and time." });
      closePreview();
      fetchScheduled();
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Could not reschedule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!previewVideo || !canEditVideo) return;
    if (!confirm("Are you sure you want to delete this video?")) return;
    setDeleting(true);
    try {
      await apiFetch(`/videos/${previewVideo.id}`, { method: "DELETE" });
      toast({ title: "Deleted", description: "Video has been removed." });
      closePreview();
      fetchScheduled();
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Could not delete",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const fetchScheduled = useCallback(async () => {
    if (!localStorage.getItem("access_token")) return;
    setLoading(true);
    try {
      const res = await apiFetch<ScheduledResponse>(
        `/videos/scheduled?year=${year}&month=${month}`
      );
      setScheduled(res);
    } catch {
      setScheduled({ year, month, days: {} });
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchScheduled();
  }, [fetchScheduled]);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;
    apiFetch<PublishingStatus>("/publishing/status")
      .then(setPublishingStatus)
      .catch(() => setPublishingStatus(null));
  }, []);

  const handleUploadHourChange = async (hourUtc: string) => {
    const value = hourUtc === "none" ? null : parseInt(hourUtc, 10);
    setSavingHour(true);
    try {
      const updated = await apiFetch<{ preferred_upload_hour_utc?: number | null }>(
        "/publishing/settings",
        {
          method: "PATCH",
          body: JSON.stringify({ preferred_upload_hour_utc: value }),
        }
      );
      setPublishingStatus((prev) =>
        prev ? { ...prev, preferred_upload_hour_utc: updated.preferred_upload_hour_utc ?? null } : null
      );
      toast({
        title: "Hour saved",
        description:
          value != null
            ? `${publishingStatus?.daily_video_limit ?? 1} video(s)/day will be published at ${String(value).padStart(2, "0")}:00 UTC.`
            : "Upload hour cleared.",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Could not save the hour",
        variant: "destructive",
      });
    } finally {
      setSavingHour(false);
    }
  };

  const goPrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const monthNameCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((daysInMonth + startDay) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startDay + 1;
    return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
  });

  const today = now.getDate();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;

  const scheduledVideos = scheduled?.days ?? {};

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your publishing schedule at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/upload">
            <Button variant="outline" size="sm" className="rounded-full gap-2">
              <Upload className="h-4 w-4" />
              Upload videos
            </Button>
          </Link>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1.5">
          <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[180px] text-center">
            {monthNameCap}
          </span>
          <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-card border border-border p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Preferred publishing time</h2>
            <p className="text-sm text-muted-foreground">
              According to your plan, up to {publishingStatus?.daily_video_limit ?? 1}{" "}
              video(s)/day can be published. Choose your preferred daily upload time (UTC).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Label className="text-sm font-medium">Upload hour (UTC)</Label>
          <Select
            value={
              publishingStatus?.preferred_upload_hour_utc != null
                ? String(publishingStatus.preferred_upload_hour_utc)
                : "none"
            }
            onValueChange={handleUploadHourChange}
            disabled={savingHour}
          >
            <SelectTrigger className="w-[160px] rounded-xl">
              <SelectValue placeholder="Choose hour" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not set</SelectItem>
              {Array.from({ length: 24 }, (_, i) => {
                const utcStr = `${String(i).padStart(2, "0")}:00 UTC`;
                const d = new Date(Date.UTC(2000, 5, 1, i, 0));
                const spainStr = d.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Europe/Madrid",
                });
                return (
                  <SelectItem key={i} value={String(i)}>
                    {utcStr} ({spainStr} Spain)
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {publishingStatus?.preferred_upload_hour_utc != null && (
            <span className="text-sm text-muted-foreground">
              {publishingStatus.daily_video_limit} video(s)/day at{" "}
              {String(publishingStatus.preferred_upload_hour_utc).padStart(2, "0")}:00 UTC (
              {new Date(
                Date.UTC(2000, 5, 1, publishingStatus.preferred_upload_hour_utc, 0)
              ).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Madrid",
              })}{" "}
              Spain)
            </span>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-card border border-border overflow-hidden relative"
      >
        <div className="grid grid-cols-7 border-b border-border bg-muted/20">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="px-4 py-4 text-[11px] font-semibold text-muted-foreground text-center uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const hasVideos = day && scheduledVideos[day];
            const isToday = isCurrentMonth && day === today;
            return (
              <div
                key={i}
                className={`min-h-[130px] border-b border-r border-border/60 p-3 transition-all duration-200 ${
                  !day ? "bg-muted/10" : "hover:bg-primary/[0.03]"
                } ${isToday ? "bg-primary/[0.04]" : ""}`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-medium ${
                          isToday
                            ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-bold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {day}
                      </span>
                      {hasVideos && (
                        <span className="text-[9px] text-primary font-semibold">
                          {scheduledVideos[day].length}
                        </span>
                      )}
                    </div>
                    {hasVideos &&
                      scheduledVideos[day].map((v, j) => (
                        <motion.button
                          key={v.id}
                          type="button"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + j * 0.05 }}
                          onClick={() => handleVideoClick(v)}
                          className="mt-1.5 w-full text-left px-2.5 py-2 rounded-lg bg-primary/10 border border-primary/15 text-primary text-[11px] font-medium truncate hover:bg-primary/15 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate" title={`${v.title} - ${formatUtcAndSpain(v.scheduled_for)}`}>
                            {v.title}
                          </span>
                        </motion.button>
                      ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
        {loading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        )}
      </motion.div>

      <Dialog open={!!previewVideo} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {previewVideo?.title} — {previewVideo && formatUtcAndSpain(previewVideo.scheduled_for)}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewLoading && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Loading preview...</span>
              </div>
            )}
            {previewUrl && !previewLoading && (
              <video
                src={previewUrl}
                controls
                autoPlay
                className="w-full rounded-lg bg-black aspect-video"
                playsInline
              />
            )}
          </div>
          {canEditVideo && (
            <div className="mt-6 pt-4 border-t border-border space-y-4">
              <h3 className="text-sm font-semibold">Move or delete</h3>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-36 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Hour (UTC)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={rescheduleHour}
                    onChange={(e) => setRescheduleHour(parseInt(e.target.value, 10) || 0)}
                    className="w-20 mt-1"
                  />
                </div>
                <Button size="sm" onClick={handleReschedule} disabled={saving}>
                  {saving ? "Saving..." : "Move"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ContentCalendar;
