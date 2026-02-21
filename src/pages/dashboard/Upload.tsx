import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload as UploadIcon, X, Clock, CheckCircle2, FileVideo, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PendingFile {
  id: string;
  file: File;
  scheduledDate: string;
  scheduledHour: number;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  videoId?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getDefaultSchedule = () => {
  const d = new Date();
  const date = d.toISOString().slice(0, 10);
  const hour = d.getUTCHours();
  return { date, hour };
};

const UploadPage = () => {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [defaultSchedule] = useState(getDefaultSchedule);
  const { toast } = useToast();

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const list = Array.from(newFiles);
      const valid = list.filter(
        (f) => f.name.toLowerCase().match(/\.(mp4|mov|webm)$/) && f.size <= 500 * 1024 * 1024
      );
      if (valid.length !== list.length) {
        toast({
          title: "Some files skipped",
          description: "Only MP4, MOV or WebM up to 500MB.",
          variant: "destructive",
        });
      }
      const pending: PendingFile[] = valid.map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file: f,
        scheduledDate: defaultSchedule.date,
        scheduledHour: defaultSchedule.hour,
        progress: 0,
        status: "pending",
      }));
      setFiles((prev) => [...prev, ...pending]);
    },
    [defaultSchedule, toast]
  );

  const removeFile = (id: string) => setFiles((f) => f.filter((x) => x.id !== id));

  const updateFileSchedule = (id: string, scheduledDate: string, scheduledHour: number) => {
    setFiles((f) =>
      f.map((x) =>
        x.id === id ? { ...x, scheduledDate, scheduledHour } : x
      )
    );
  };

  const uploadOne = async (pending: PendingFile): Promise<void> => {
    const form = new FormData();
    form.append("file", pending.file);
    form.append("scheduled_date", pending.scheduledDate);
    form.append("scheduled_hour", String(pending.scheduledHour));
    setFiles((f) =>
      f.map((x) => (x.id === pending.id ? { ...x, status: "uploading" as const, progress: 50 } : x))
    );
    try {
      const res = await apiFetch<{ id: string }>("/videos/upload", {
        method: "POST",
        body: form,
      });
      setFiles((f) =>
        f.map((x) =>
          x.id === pending.id ? { ...x, status: "done", progress: 100, videoId: res.id } : x
        )
      );
      toast({
        title: "Video scheduled",
        description: `${pending.file.name} scheduled successfully.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload error";
      setFiles((f) =>
        f.map((x) =>
          x.id === pending.id ? { ...x, status: "error", error: msg } : x
        )
      );
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const uploadAll = async () => {
    const toUpload = files.filter((f) => f.status === "pending");
    for (const p of toUpload) {
      await uploadOne(p);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold">Upload</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Upload your Shorts and schedule them. A ±10 min random margin will be applied for a cleaner algorithm.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-2xl p-20 text-center transition-all duration-300 cursor-pointer mb-10 relative overflow-hidden group ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/40 hover:bg-primary/[0.02]"
        }`}
      >
        <div className="absolute inset-0 bg-radial-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <label className="relative block cursor-pointer">
          <input
            type="file"
            accept=".mp4,.mov,.webm"
            multiple
            className="hidden"
            onChange={(e) => {
              const fs = e.target.files;
              if (fs?.length) addFiles(fs);
              e.target.value = "";
            }}
          />
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 glow-sm group-hover:glow transition-all duration-300">
            <UploadIcon className="h-9 w-9 text-primary" />
          </div>
          <p className="font-display font-semibold text-xl mb-2">Drop your videos here</p>
          <p className="text-base text-muted-foreground mb-6">or click to browse · MP4, MOV, WebM up to 500MB</p>
        </label>
      </motion.div>

      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display font-semibold text-lg">{files.length} videos</h2>
              {doneCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 font-semibold">
                  {doneCount} uploaded
                </span>
              )}
              {pendingCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  className="rounded-full px-5 glow-sm"
                  onClick={uploadAll}
                >
                  Upload all
                </Button>
              )}
              <Link to="/dashboard/calendar">
                <Button size="sm" variant="outline" className="rounded-full px-5">
                  View calendar
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-border/70">
            {files.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="px-6 py-5 flex flex-wrap items-center gap-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center shrink-0">
                    {item.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : item.status === "error" ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : (
                      <FileVideo className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-muted-foreground">{formatFileSize(item.file.size)}</p>
                      {item.status === "uploading" && (
                        <span className="text-xs text-primary">Uploading...</span>
                      )}
                      {item.status === "error" && (
                        <span className="text-xs text-destructive">{item.error}</span>
                      )}
                    </div>
                  </div>
                </div>
                {item.status === "pending" && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <Input
                        type="date"
                        value={item.scheduledDate}
                        onChange={(e) =>
                          updateFileSchedule(item.id, e.target.value, item.scheduledHour)
                        }
                        className="w-36 h-9 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Hour (UTC)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={23}
                        value={item.scheduledHour}
                        onChange={(e) => {
                          const h = parseInt(e.target.value, 10);
                          if (!isNaN(h) && h >= 0 && h <= 23) {
                            updateFileSchedule(item.id, item.scheduledDate, h);
                          }
                        }}
                        className="w-16 h-9 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {item.scheduledDate} {String(item.scheduledHour).padStart(2, "0")}:00 UTC (±10 min)
                    </div>
                  </div>
                )}
                {item.status === "done" && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Scheduled (±10 min)
                  </div>
                )}
                <button
                  onClick={() => removeFile(item.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UploadPage;
