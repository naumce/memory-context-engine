import { Activity, Truck, TrendingUp, Zap } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import MetricCard from "@/components/admin/MetricCard";
import MapView from "@/components/admin/MapView";
import FleetList from "@/components/admin/FleetList";
import LiveFeed from "@/components/admin/LiveFeed";
import AlertPanel from "@/components/admin/AlertPanel";
import ZoneStatus from "@/components/admin/ZoneStatus";
import PerformanceMetrics from "@/components/admin/PerformanceMetrics";
import PilotZonePanel from "@/components/admin/PilotZonePanel";
import RealtimeIndicator from "@/components/admin/RealtimeIndicator";
import { useActiveTrucks } from "@/hooks/useTrucks";
import { useZones } from "@/hooks/useZones";
import { useRealtimeTrucks } from "@/hooks/useRealtimeTrucks";
import { useRealtimeZones } from "@/hooks/useRealtimeZones";
import { useRealtimeCollections } from "@/hooks/useRealtimeCollections";

const Admin = () => {
  useRealtimeTrucks();
  useRealtimeZones();
  useRealtimeCollections();
  
  const { data: truckStats, isLoading: trucksLoading } = useActiveTrucks();
  const { data: zones, isLoading: zonesLoading } = useZones();
  
  const cityHealthScore = 94;
  const householdsEngaged = zones?.reduce((sum, z) => sum + (z.households_count || 0), 0) || 0;
  const wasteCollected = 42;

  if (trucksLoading || zonesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass rounded-lg p-8 border-2 border-primary/30">
          <p className="font-display text-primary">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      
      {/* Header Bar */}
      <header className="glass border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display text-primary text-glow-primary">
                Project Phoenix
              </h1>
              <p className="text-sm text-muted-foreground font-mono">Command Center</p>
            </div>
            <div className="flex items-center gap-4">
              <RealtimeIndicator />
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
            title="Households Engaged"
            value={householdsEngaged}
            unit=""
            icon={Activity}
            trend="+8%"
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
            value={`${truckStats?.active || 0}/${truckStats?.total || 0}`}
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

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ZoneStatus />
          <PerformanceMetrics />
        </div>

        {/* Pilot Zone A Operational Context */}
        <PilotZonePanel />
      </main>
    </div>
  );
};

export default Admin;
