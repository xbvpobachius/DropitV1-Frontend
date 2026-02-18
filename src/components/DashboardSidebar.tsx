import { Package, Store, Youtube, Calendar, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";

const DashboardSidebar = () => {
  const { progress } = useOnboardingFlow();

  // Show onboarding steps only while product/store/YouTube not all done (same logic as DashboardLayout)
  const onboardingDone = Boolean(
    progress?.product_selected && progress?.store_created && progress?.youtube_connected
  );
  const showOnboarding = !onboardingDone;

  const onboardingItems = [
    { icon: Package, label: "Select Product", path: "/dashboard/select-product" },
    { icon: Store, label: "Create Store", path: "/dashboard/create-store" },
    { icon: Youtube, label: "Connect YouTube", path: "/dashboard/connect-youtube" },
  ];

  const completedItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/overview" },
    { icon: Calendar, label: "Calendar", path: "/dashboard/calendar" },
    { icon: Youtube, label: "Reconnect YouTube", path: "/dashboard/connect-youtube" },
  ];

  const itemsToShow = showOnboarding ? onboardingItems : completedItems;

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen pt-24">
      <nav className="p-4 space-y-2">
        {itemsToShow.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/30 glow-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:glow-primary"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
