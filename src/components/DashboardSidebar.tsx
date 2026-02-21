import { Youtube, Calendar, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";

const DashboardSidebar = () => {
  const { progress } = useOnboardingFlow();
  const onboardingDone = Boolean(progress?.youtube_connected);
  const showOnboarding = !onboardingDone;

  const onboardingItems = [
    { icon: Youtube, label: "Connect YouTube", path: "/dashboard/connect-youtube" },
  ];

  const completedItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/overview" },
    { icon: Calendar, label: "Calendar", path: "/dashboard/calendar" },
    { icon: Youtube, label: "Reconnect YouTube", path: "/dashboard/connect-youtube" },
  ];

  const itemsToShow = showOnboarding ? onboardingItems : completedItems;

  return (
    <aside className="w-56 bg-white border-r border-border min-h-screen pt-20">
      <nav className="p-4 space-y-1">
        {itemsToShow.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
