import { useState } from "react";
import { Activity, Truck, Coins, AlertTriangle, Zap, TrendingUp } from "lucide-react";
import MetricCard from "@/components/admin/MetricCard";
import MapView from "@/components/admin/MapView";
import FleetList from "@/components/admin/FleetList";
import LiveFeed from "@/components/admin/LiveFeed";
import AlertPanel from "@/components/admin/AlertPanel";

const Admin = () => {
  const [cityHealthScore] = useState(94);
  const [revenueToday] = useState(1240);
  const [wasteCollected] = useState(42);
  const [activeTrucks] = useState({ active: 8, total: 10 });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="glass border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display text-primary text-glow-primary">
                Project Phoenix
              </h1>
              <p className="text-sm text-muted-foreground font-mono">Command Center</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">The Chairman</p>
                <p className="text-sm font-semibold">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-8">
        {/* Top Metrics - The Pulse */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="City Health Score"
            value={cityHealthScore}
            unit="/100"
            icon={Activity}
            trend="+5%"
            variant="primary"
          />
          <MetricCard
            title="Revenue Today"
            value={revenueToday}
            unit="€"
            icon={Coins}
            trend="+12%"
            variant="secondary"
          />
          <MetricCard
            title="Waste Collected"
            value={wasteCollected}
            unit="Tons"
            icon={TrendingUp}
            trend="+8%"
            variant="accent"
          />
          <MetricCard
            title="Active Trucks"
            value={`${activeTrucks.active}/${activeTrucks.total}`}
            icon={Truck}
            variant="muted"
          />
        </div>

        {/* Alert Banner */}
        <AlertPanel />

        {/* Main Grid - Map + Sidebars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left Sidebar - Fleet Management */}
          <div className="lg:col-span-3">
            <FleetList />
          </div>

          {/* Center - The Mayor's Eye (Map) */}
          <div className="lg:col-span-6">
            <MapView />
          </div>

          {/* Right Sidebar - Live Activity Feed */}
          <div className="lg:col-span-3">
            <LiveFeed />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
