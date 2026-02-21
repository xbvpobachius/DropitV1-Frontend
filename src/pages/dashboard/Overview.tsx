import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Play,
  Sparkles,
  Upload,
} from "lucide-react";
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

type ActivityLog = {
  type: "upload" | "publish";
  id: string;
  title: string;
  status: string;
  time: string;
  date: Date;
};

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

const formatScheduledTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  if (d > now) {
    const sec = Math.floor((d.getTime() - now.getTime()) / 1000);
    if (sec < 86400) return `In ${Math.floor(sec / 3600)}h`;
    if (sec < 604800) return `In ${Math.floor(sec / 86400)}d`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  return formatRelativeTime(iso);
};

const viewsData = [
  { day: "Mon", views: 4200 },
  { day: "Tue", views: 6800 },
  { day: "Wed", views: 5100 },
  { day: "Thu", views: 9400 },
  { day: "Fri", views: 7200 },
  { day: "Sat", views: 11800 },
  { day: "Sun", views: 8900 },
];

const stats = [
  { label: "Scheduled", value: "24", icon: CalendarClock, change: "+3 today", color: "text-primary", bgGlow: "from-primary/10 to-primary/5" },
  { label: "Published", value: "142", icon: CheckCircle2, change: "+8 this week", color: "text-success", bgGlow: "from-success/10 to-success/5" },
  { label: "Next Upload", value: "2h 15m", icon: Clock, change: "Today at 3 PM", color: "text-blue-400", bgGlow: "from-blue-400/10 to-blue-400/5" },
  { label: "Avg. Views", value: "12.4K", icon: TrendingUp, change: "+18%", color: "text-sky-400", bgGlow: "from-sky-400/10 to-sky-400/5" },
];

const Overview = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;
    const load = async () => {
      try {
        const [uploads, publications] = await Promise.all([
          apiFetch<UploadLog[]>("/videos/recent?limit=10"),
          apiFetch<PublicationLog[]>("/publishing/logs?limit=20"),
        ]);
        const logs: ActivityLog[] = [
          ...uploads.map((u) => ({
            type: "upload" as const,
            id: u.id,
            title: u.title,
            status: u.status === "uploaded" ? "Published" : u.status === "scheduled" ? "Scheduled" : "Draft",
            time: u.scheduled_for ? formatScheduledTime(u.scheduled_for) : formatRelativeTime(u.created_at),
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
        logs.sort((a, b) => b.date.getTime() - a.date.getTime());
        setActivityLogs(logs.slice(0, 15));
      } catch {
        setActivityLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-medium text-success">All systems online</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Welcome back. Here&apos;s your Shorts overview.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Pro Trial · 12 days left
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="group p-6 rounded-2xl bg-card border border-border hover-glow transition-all duration-300 relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center group-hover:bg-muted/60 transition-colors">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="font-display text-4xl font-bold tracking-tight">{stat.value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <ArrowUpRight className={`h-3 w-3 ${stat.color}`} />
                <p className={`text-xs font-medium ${stat.color}`}>{stat.change}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activity & Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl bg-card border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Recent Activity</h2>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium px-3 py-1.5 rounded-full bg-muted/50">
              Uploads &amp; Publications
            </span>
          </div>
          <div className="divide-y divide-border/70">
            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">Loading...</div>
            ) : activityLogs.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">No activity yet.</div>
            ) : (
              activityLogs.map((item, i) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.03 }}
                  className="px-6 py-5 flex items-center justify-between hover:bg-muted/20 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-muted/40 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      {item.type === "upload" ? (
                        <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      ) : (
                        <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[180px] group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-muted-foreground uppercase">{item.type}</span>
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
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Views Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card border border-border p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold text-lg">Views</h2>
            <div className="flex items-center gap-1.5 text-success text-xs font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +18% this week
            </div>
          </div>
          <p className="text-3xl font-display font-bold tracking-tight mb-4">53.4K</p>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Subscribers", value: "+1,240", change: "+8%" },
              { label: "Watch Time", value: "842h", change: "+15%" },
              { label: "Engagement", value: "4.2%", change: "+0.3%" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-muted/30 border border-border/50 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-sm font-bold">{m.value}</p>
                <span className="text-[9px] text-success font-semibold">{m.change}</span>
              </div>
            ))}
          </div>
          <div className="h-52 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsData} barCategoryGap="20%">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }} dy={8} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(225, 20%, 12%)",
                    border: "1px solid hsl(220, 15%, 20%)",
                    borderRadius: "10px",
                    fontSize: "12px",
                    color: "hsl(220, 10%, 90%)",
                  }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(1)}K`, "Views"]}
                  cursor={{ fill: "hsl(220, 15%, 14%)" }}
                />
                <Bar dataKey="views" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Overview;
