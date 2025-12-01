import { MapPin, Users, Trash2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useZones } from "@/hooks/useZones";
import { useZonePerformance } from "@/hooks/useZonePerformance";

const ZoneStatus = () => {
  const { data: zones, isLoading } = useZones();
  const { data: performance, isLoading: perfLoading } = useZonePerformance();

  if (isLoading || perfLoading) {
    return (
      <div className="glass rounded-lg border-2 border-border p-6">
        <p className="text-muted-foreground font-mono text-sm">Loading zones...</p>
      </div>
    );
  }

  const getZoneStatus = (participation: number) => {
    if (participation < 60) return "critical";
    if (participation < 75) return "warning";
    return "healthy";
  };

  const getPerformanceData = (zoneId: string) => {
    return performance?.find(p => p.zoneId === zoneId);
  };
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
        {zones?.map((zone) => {
          const perfData = getPerformanceData(zone.id);
          const participation = perfData?.participationRate || 0;
          const status = getZoneStatus(participation);
          
          return (
            <div
              key={zone.id}
              className={cn(
                "glass rounded-lg p-4 border-2 transition-all hover:scale-[1.02]",
                status === "critical" ? "border-destructive/50" :
                status === "warning" ? "border-warning/50" :
                "border-border"
              )}
            >
              {/* Zone Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-display text-sm",
                    status === "critical" ? "bg-destructive/20 text-destructive" :
                    status === "warning" ? "bg-warning/20 text-warning" :
                    "bg-primary/20 text-primary"
                  )}>
                    {zone.code.split('-')[1]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{zone.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      {perfData?.nextCollection || "Not scheduled"}
                    </p>
                  </div>
                </div>
                {status === "critical" && (
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
                  <span className="font-mono font-semibold">{zone.households_count}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Participation</span>
                    <span className="font-mono font-semibold">{participation}%</span>
                  </div>
                  <Progress value={participation} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Collected Today</span>
                  </div>
                  <span className="font-mono font-semibold">{perfData?.collectedToday || 0} tons</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default ZoneStatus;
