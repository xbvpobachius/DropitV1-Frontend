import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const scheduledVideos: Record<number, { title: string; time: string }[]> = {
  3: [{ title: "Morning Routine #48", time: "9:00 AM" }],
  5: [{ title: "Quick Recipe: Tacos", time: "12:00 PM" }],
  8: [{ title: "Fitness Hack #13", time: "3:00 PM" }],
  12: [
    { title: "Desk Setup Tour", time: "9:00 AM" },
    { title: "Productivity Tips", time: "3:00 PM" },
  ],
  15: [{ title: "Behind The Scenes #9", time: "6:00 PM" }],
  19: [{ title: "Morning Routine #49", time: "9:00 AM" }],
  22: [{ title: "Quick Hack: Phone", time: "12:00 PM" }],
  26: [{ title: "60s Recipe: Salad", time: "3:00 PM" }],
};

const ContentCalendar = () => {
  const [currentMonth] = useState("February 2026");

  const daysInMonth = 28;
  const startDay = 6;
  const totalCells = Math.ceil((daysInMonth + startDay) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startDay + 1;
    return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-2">Your publishing schedule at a glance.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1.5">
          <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[140px] text-center">{currentMonth}</span>
          <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-card border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/20">
          {daysOfWeek.map((day) => (
            <div key={day} className="px-4 py-4 text-[11px] font-semibold text-muted-foreground text-center uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const hasVideos = day && scheduledVideos[day];
            const isToday = day === 21;
            return (
              <div
                key={i}
                className={`min-h-[130px] border-b border-r border-border/60 p-3 transition-all duration-200 ${
                  !day ? "bg-muted/10" : "hover:bg-primary/[0.03] cursor-pointer"
                } ${isToday ? "bg-primary/[0.04]" : ""}`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${
                        isToday
                          ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-bold"
                          : "text-muted-foreground"
                      }`}>
                        {day}
                      </span>
                      {hasVideos && (
                        <span className="text-[9px] text-primary font-semibold">
                          {scheduledVideos[day].length}
                        </span>
                      )}
                    </div>
                    {scheduledVideos[day]?.map((v, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + j * 0.05 }}
                        className="mt-1.5 px-2.5 py-2 rounded-lg bg-primary/10 border border-primary/15 text-primary text-[11px] font-medium truncate hover:bg-primary/15 transition-colors flex items-center gap-1.5"
                      >
                        <Play className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{v.title}</span>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContentCalendar;
