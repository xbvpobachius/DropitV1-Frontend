import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Play } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface UploadLog {
  id: string;
  title: string;
  status: string;
  scheduled_for: string | null;
  created_at: string;
}

interface PublicationLog {
  id: string;
  video_filename: string;
  published_at: string;
  status: string;
}

interface NotificationItem {
  type: "upload" | "publish";
  id: string;
  title: string;
  status: string;
  time: string;
  date: Date;
}

const formatRelativeTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleDateString();
};

const Notifications = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;
    const load = async () => {
      try {
        const [uploads, publications] = await Promise.all([
          apiFetch<UploadLog[]>("/videos/recent?limit=15"),
          apiFetch<PublicationLog[]>("/publishing/logs?limit=15"),
        ]);
        const list: NotificationItem[] = [
          ...uploads.map((u) => ({
            type: "upload" as const,
            id: u.id,
            title: u.title,
            status: u.status === "uploaded" ? "Published" : u.status === "scheduled" ? "Scheduled" : "Draft",
            time: formatRelativeTime(u.created_at),
            date: new Date(u.created_at),
          })),
          ...publications.map((p) => ({
            type: "publish" as const,
            id: p.id,
            title: p.video_filename,
            status: p.status === "uploaded" ? "Published" : "Failed",
            time: formatRelativeTime(p.published_at),
            date: new Date(p.published_at),
          })),
        ];
        list.sort((a, b) => b.date.getTime() - a.date.getTime());
        setItems(list.slice(0, 20));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Activity for your account — uploads and publications only.
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border overflow-hidden"
      >
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No activity yet. Your uploads and publications will appear here.
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {items.map((item, i) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="px-6 py-5 flex items-center justify-between hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-muted/40 flex items-center justify-center">
                    {item.type === "upload" ? (
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Play className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[240px]">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                    item.status === "Published"
                      ? "bg-success/10 text-success border border-success/20"
                      : item.status === "Scheduled"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : item.status === "Failed"
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {item.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Notifications;
