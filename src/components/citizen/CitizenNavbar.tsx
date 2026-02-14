import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, AlertTriangle, Recycle, User, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCitizenAuth } from "@/hooks/useCitizenAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/citizen", icon: Home, label: "Dashboard" },
  { path: "/citizen/schedule", icon: Calendar, label: "Schedule" },
  { path: "/citizen/report", icon: AlertTriangle, label: "Report" },
  { path: "/citizen/recycling", icon: Recycle, label: "Recycling" },
  { path: "/citizen/profile", icon: User, label: "Profile" },
];

const CitizenNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useCitizenAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/citizen/auth");
  };

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/citizen" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-display text-sm text-primary">Phoenix Citizen</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Bottom navigation (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_rgba(57,255,20,0.8)]")} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default CitizenNavbar;
