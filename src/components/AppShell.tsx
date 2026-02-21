import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  CalendarDays,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/overview" },
  { label: "Upload", icon: Upload, href: "/dashboard/upload" },
  { label: "Calendar", icon: CalendarDays, href: "/dashboard/calendar" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscriptionTier, isSubscribed, hasTestSubscription } = useSubscription();
  const userEmail = localStorage.getItem("user_email") || "Account";

  const handleSignOut = () => {
    if (localStorage.getItem("access_token")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_email");
      sessionStorage.removeItem("test_subscription");
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith("test_subscription_")) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      window.dispatchEvent(new Event("dropit-auth-change"));
    }
    toast({ title: "Signed out", description: "You've been successfully signed out." });
    navigate("/");
  };

  const planLabel = hasTestSubscription ? "Pro Trial" : isSubscribed ? (subscriptionTier || "Pro") : "Free";

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Ambient glow */}
      <div className="fixed top-0 left-32 w-96 h-96 bg-primary/[0.04] blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-primary/[0.03] blur-[100px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-card/80 backdrop-blur-xl border-r border-border/60 flex flex-col z-40">
        <div className="p-7 pb-5">
          <Link to="/" className="font-display font-bold text-xl text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center glow-sm">
              <Zap className="h-4.5 w-4.5 text-primary" />
            </div>
            <span>Drop<span className="text-primary">It</span></span>
          </Link>
        </div>

        {/* Plan badge */}
        <div className="mx-5 mb-5 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Current Plan</p>
              <p className="text-sm font-semibold text-primary mt-0.5 capitalize">{planLabel}</p>
            </div>
            <Link to="/pricing">
              <ChevronRight className="h-4 w-4 text-primary/50 hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary border-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "text-primary")} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-border/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-foreground/70">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userEmail}</p>
              <p className="text-xs text-muted-foreground truncate">DropIt account</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all mt-1 w-full"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-[280px] relative">
        <div className="absolute inset-0 bg-dots opacity-10 pointer-events-none" />
        <div className="relative p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;
