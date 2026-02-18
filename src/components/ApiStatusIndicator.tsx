import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ApiStatusIndicator = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      await api.getHealth();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      console.error("API connection failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    toast({
      title: "API Offline",
      description: "Backend connection failed. Please check the server status.",
      variant: "destructive",
    });
  };

  // Only show when there's an error
  if (isConnected === null || isConnected) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors hover:bg-secondary/80 bg-muted/50"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
      <WifiOff className="w-3 h-3 text-muted-foreground" />
      <span className="text-muted-foreground font-medium">Offline</span>
    </button>
  );
};