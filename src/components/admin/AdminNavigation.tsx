import { LayoutDashboard, MapPin, Home, Trash, Megaphone, Building } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const AdminNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/zones", icon: MapPin, label: "Zones" },
    { to: "/admin/households", icon: Home, label: "Households" },
    { to: "/admin/bins", icon: Trash, label: "Bins" },
    { to: "/admin/campaigns", icon: Megaphone, label: "Campaigns" },
    { to: "/admin/organization", icon: Building, label: "Organization" }
  ];

  return (
    <nav className="glass border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-1 py-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-mono text-sm whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavigation;

