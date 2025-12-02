import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrucks } from "@/hooks/useTrucks";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1Ijoia2Fib20xMSIsImEiOiJjbWE0NnU5NXUwMzF2MnFxdTQxMmFtbHA0In0.LMMt9w1PlrlQCL3WU5lp9Q";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { data: trucksData, isLoading } = useTrucks();
  
  mapboxgl.accessToken = MAPBOX_TOKEN;

  const trucks = trucksData?.map((truck, idx) => ({
    id: truck.vehicle_id,
    lat: 41.1781 + (idx * 0.004),
    lng: 20.7714 - (idx * 0.006),
    status: truck.status,
  })) || [];

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [20.7714, 41.1781], // Struga, North Macedonia
        zoom: 13,
        pitch: 45,
        bearing: -17.6,
      });

      map.current.on("load", () => {
        if (map.current) {
          map.current.addLayer({
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 14,
            paint: {
              "fill-extrusion-color": "#1a1a2e",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.6,
            },
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markers.current).forEach((marker) => marker.remove());
    markers.current = {};

    // Add new markers for trucks
    trucks.forEach((truck) => {
      const el = document.createElement("div");
      el.className = "truck-marker";
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = truck.status === "active" ? "#00ff87" : "#fbbf24";
      el.style.border = "3px solid rgba(255,255,255,0.3)";
      el.style.boxShadow = `0 0 20px ${truck.status === "active" ? "#00ff87" : "#fbbf24"}`;
      el.style.cursor = "pointer";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([truck.lng, truck.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="color: #000; padding: 4px;">
              <strong>${truck.id}</strong><br/>
              Status: ${truck.status}
            </div>`
          )
        )
        .addTo(map.current!);

      markers.current[truck.id] = marker;
    });
  }, [trucks]);

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
      <div className="w-full h-full relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass rounded-lg p-4 border border-border z-10">
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
        <div className="absolute top-20 right-4 glass rounded-lg p-4 border border-primary/30 z-10">
          <p className="text-xs text-muted-foreground mb-1">Struga Municipality</p>
          <p className="font-display text-2xl text-primary text-glow-primary">
            {trucks.filter(t => t.status === "active").length}
          </p>
          <p className="text-xs font-mono">Trucks Active</p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
