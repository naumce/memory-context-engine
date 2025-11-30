import { useState } from "react";
import { MapPin, Navigation, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrucks } from "@/hooks/useTrucks";

const MapView = () => {
  const [mapboxToken, setMapboxToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(true);
  const { data: trucksData, isLoading } = useTrucks();

  // Map truck data to display format with simulated coordinates
  const trucks = trucksData?.map((truck, idx) => ({
    id: truck.vehicle_id,
    lat: 41.1781 + (idx * 0.004),
    lng: 20.7714 - (idx * 0.006),
    status: truck.status,
  })) || [];

  if (isLoading) {
    console.log("Loading trucks...");
  }

  return (
    <div className="glass rounded-lg border-2 border-border overflow-hidden h-[600px] relative">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-10 glass border-b border-border">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm">THE MAYOR'S EYE</h3>
              <p className="text-xs text-muted-foreground font-mono">Live Digital Twin</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="glass">
              <Navigation className="w-4 h-4 mr-2" />
              Flyover
            </Button>
            <Button size="sm" variant="outline" className="glass">
              <MapPin className="w-4 h-4 mr-2" />
              Heatmap
            </Button>
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="w-full h-full bg-muted/20 flex items-center justify-center">
        {showTokenInput ? (
          <div className="glass rounded-lg p-8 max-w-md w-full mx-4 border-2 border-primary/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary mx-auto mb-4 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-lg mb-2">3D Map Initialization</h3>
              <p className="text-sm text-muted-foreground">
                Enter your Mapbox public token to activate the digital twin
              </p>
              <a
                href="https://mapbox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary/80 underline mt-2 inline-block"
              >
                Get your token at mapbox.com
              </a>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="pk.eyJ1Ij..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="font-mono text-xs bg-background/50"
              />
              <Button
                onClick={() => {
                  if (mapboxToken) {
                    setShowTokenInput(false);
                    // Here you would initialize the actual Mapbox map
                  }
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display"
              >
                Activate Map
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Mock Map Visualization */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted">
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full grid grid-cols-12 grid-rows-12">
                  {Array.from({ length: 144 }).map((_, i) => (
                    <div key={i} className="border border-border/20" />
                  ))}
                </div>
              </div>
              
              {/* Mock Trucks */}
              {trucks.map((truck) => (
                <div
                  key={truck.id}
                  className="absolute"
                  style={{
                    left: `${((truck.lng - 20.75) / 0.05) * 100}%`,
                    top: `${100 - ((truck.lat - 41.17) / 0.02) * 100}%`,
                  }}
                >
                  <div className="relative">
                    <div className={cn(
                      "w-4 h-4 rounded-full animate-pulse-glow",
                      truck.status === "active" ? "bg-primary" : "bg-warning"
                    )} />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="glass px-2 py-1 rounded text-xs font-mono">
                        {truck.id}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 glass rounded-lg p-4 border border-border">
                <h4 className="font-display text-xs mb-2">Fleet Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="font-mono">Active Collection</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="font-mono">Idle / Standby</span>
                  </div>
                </div>
              </div>

              {/* Stats Overlay */}
              <div className="absolute top-20 right-4 glass rounded-lg p-4 border border-primary/30">
                <p className="text-xs text-muted-foreground mb-1">Struga Municipality</p>
                <p className="font-display text-2xl text-primary text-glow-primary">
                  {trucks.filter(t => t.status === "active").length}
                </p>
                <p className="text-xs font-mono">Trucks Active</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default MapView;
