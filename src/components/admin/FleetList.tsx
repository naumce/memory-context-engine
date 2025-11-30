import { Truck, Battery, MapPin, Clock } from "lucide-react";

const fleetData = [
  { id: "TRK-01", driver: "Marko D.", status: "active", battery: 87, speed: 32, zone: "Zone A" },
  { id: "TRK-02", driver: "Stefan K.", status: "active", battery: 92, speed: 28, zone: "Zone B" },
  { id: "TRK-03", driver: "Ivan P.", status: "idle", battery: 100, speed: 0, zone: "Depot" },
  { id: "TRK-04", driver: "Nikola M.", status: "active", battery: 65, speed: 35, zone: "Zone C" },
  { id: "TRK-05", driver: "Gjoko T.", status: "charging", battery: 45, speed: 0, zone: "Depot" },
];

const FleetList = () => {
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
        {fleetData.map((truck) => (
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
                <span className="font-mono text-sm font-bold">{truck.id}</span>
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
              <span className="font-semibold text-foreground">{truck.driver}</span>
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Battery className={cn(
                  "w-3 h-3",
                  truck.battery > 80 ? "text-primary" :
                  truck.battery > 50 ? "text-warning" :
                  "text-destructive"
                )} />
                <span className="font-mono">{truck.battery}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono">{truck.speed} km/h</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="w-3 h-3 text-secondary" />
                <span className="font-mono text-secondary">{truck.zone}</span>
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
