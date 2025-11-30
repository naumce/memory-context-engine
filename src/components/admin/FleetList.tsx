import { Truck, Battery, MapPin, Clock } from "lucide-react";
import { useTrucks } from "@/hooks/useTrucks";

const FleetList = () => {
  const { data: trucks, isLoading } = useTrucks();
  
  if (isLoading) {
    return (
      <div className="glass rounded-lg border-2 border-border p-4 h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground font-mono text-sm">Loading fleet...</p>
      </div>
    );
  }
  return (
    <div className="glass rounded-lg border-2 border-border p-4 h-[600px] overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-secondary/20">
          <Truck className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-display text-sm">FLEET COMMAND</h3>
          <p className="text-xs text-muted-foreground font-mono">Real-time Tracking</p>
        </div>
      </div>

      <div className="space-y-3">
        {trucks?.map((truck) => (
          <div
            key={truck.id}
            className="glass rounded-lg p-4 border border-border hover:border-primary/50 transition-all cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  truck.status === "active" ? "bg-primary" :
                  truck.status === "charging" ? "bg-warning" :
                  "bg-muted-foreground"
                )} />
                <span className="font-mono text-sm font-bold">{truck.vehicle_id}</span>
              </div>
              <span className={cn(
                "text-xs font-mono px-2 py-1 rounded uppercase",
                truck.status === "active" ? "bg-primary/20 text-primary" :
                truck.status === "charging" ? "bg-warning/20 text-warning" :
                "bg-muted text-muted-foreground"
              )}>
                {truck.status}
              </span>
            </div>

            {/* Driver */}
            <p className="text-xs text-muted-foreground mb-3">
              <span className="font-semibold text-foreground">
                {truck.driver?.full_name || "No driver assigned"}
              </span>
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Battery className={cn(
                  "w-3 h-3",
                  truck.battery_level > 80 ? "text-primary" :
                  truck.battery_level > 50 ? "text-warning" :
                  "text-destructive"
                )} />
                <span className="font-mono">{truck.battery_level}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono">{truck.status === "active" ? "32" : "0"} km/h</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="w-3 h-3 text-secondary" />
                <span className="font-mono text-secondary">
                  {truck.zone?.name || "Depot"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default FleetList;
