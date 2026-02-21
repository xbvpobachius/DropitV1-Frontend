import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload as UploadIcon, X, Clock, CheckCircle2, FileVideo } from "lucide-react";

interface VideoFile {
  id: string;
  name: string;
  size: string;
  scheduledTime: string;
  progress: number;
}

const UploadPage = () => {
  const [files, setFiles] = useState<VideoFile[]>([]);

  const removeFile = (id: string) => setFiles(files.filter((f) => f.id !== id));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold">Upload</h1>
        <p className="text-sm text-muted-foreground mt-2">Upload your Shorts in batch and schedule them.</p>
      </div>

      {/* Drop Zone - links to Calendar for scheduling */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-2 border-dashed border-border rounded-2xl p-20 text-center hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer mb-10 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-radial-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 glow-sm group-hover:glow transition-all duration-300">
            <UploadIcon className="h-9 w-9 text-primary" />
          </div>
          <p className="font-display font-semibold text-xl mb-2">Drop your videos here</p>
          <p className="text-base text-muted-foreground mb-6">or click to browse · MP4, MOV, WebM up to 500MB</p>
          <Link to="/dashboard/calendar">
            <Button variant="outline" className="rounded-full hover-glow">
              Schedule in Calendar
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* File List - only when there are files */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-border overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display font-semibold text-lg">{files.length} videos ready</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {files.filter((f) => f.progress === 100).length} uploaded
              </span>
            </div>
            <Link to="/dashboard/calendar">
              <Button size="sm" className="rounded-full px-5 glow-sm">
                Schedule All
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border/70">
            {files.map((file, i) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="px-6 py-5 flex items-center justify-between hover:bg-muted/20 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    {file.progress === 100 ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <FileVideo className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                      {file.progress < 100 && (
                        <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                          <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${file.progress}%` }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                          <span className="text-[10px] text-primary font-medium">{file.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {file.scheduledTime}
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UploadPage;
