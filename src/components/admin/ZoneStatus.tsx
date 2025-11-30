import { MapPin, Users, Trash2, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const zones = [
  { 
    id: "A", 
    name: "Pilot Zone A", 
    households: 450, 
    participation: 87, 
    collected: 12.4,
    status: "healthy",
    nextCollection: "Tomorrow 08:00"
  },
  { 
    id: "B", 
    name: "Central District", 
    households: 1200, 
    participation: 72, 
    collected: 28.6,
    status: "warning",
    nextCollection: "In 4 hours"
  },
  { 
    id: "C", 
    name: "North Sector", 
    households: 800, 
    participation: 65, 
    collected: 18.2,
    status: "healthy",
    nextCollection: "Today 14:00"
  },
  { 
    id: "D", 
    name: "South Industrial", 
    households: 350, 
    participation: 54, 
    collected: 42.8,
    status: "critical",
    nextCollection: "URGENT"
  },
];

const ZoneStatus = () => {
  return (
    <div className="glass rounded-lg border-2 border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/20">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-sm">ZONE STATUS</h3>
          <p className="text-xs text-muted-foreground font-mono">Collection Areas Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={cn(
              "glass rounded-lg p-4 border-2 transition-all hover:scale-[1.02]",
              zone.status === "critical" ? "border-destructive/50" :
              zone.status === "warning" ? "border-warning/50" :
              "border-border"
            )}
          >
            {/* Zone Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-display text-sm",
                  zone.status === "critical" ? "bg-destructive/20 text-destructive" :
                  zone.status === "warning" ? "bg-warning/20 text-warning" :
                  "bg-primary/20 text-primary"
                )}>
                  {zone.id}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{zone.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{zone.nextCollection}</p>
                </div>
              </div>
              {zone.status === "critical" && (
                <AlertCircle className="w-5 h-5 text-destructive animate-pulse" />
              )}
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Households</span>
                </div>
                <span className="font-mono font-semibold">{zone.households}</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Participation</span>
                  <span className="font-mono font-semibold">{zone.participation}%</span>
                </div>
                <Progress value={zone.participation} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Collected Today</span>
                </div>
                <span className="font-mono font-semibold">{zone.collected} tons</span>
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

export default ZoneStatus;
