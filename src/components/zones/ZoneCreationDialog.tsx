import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { Save, MapPin } from "lucide-react";

const MAPBOX_TOKEN = "pk.eyJ1Ijoia2Fib20xMSIsImEiOiJjbWE0NnU5NXUwMzF2MnFxdTQxMmFtbHA0In0.LMMt9w1PlrlQCL3WU5lp9Q";

interface ZoneCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ZoneCreationDialog = ({ open, onOpenChange, onSuccess }: ZoneCreationDialogProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    households_count: 0
  });
  const [hasDrawnBoundary, setHasDrawnBoundary] = useState(false);

  useEffect(() => {
    if (!open || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [20.6783, 41.1781],
      zoom: 13,
      pitch: 45,
      maxBounds: [
        [20.6, 41.15],
        [20.75, 41.21]
      ],
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      styles: [
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          paint: {
            "fill-color": "#00ff87",
            "fill-opacity": 0.2
          }
        },
        {
          id: "gl-draw-polygon-stroke",
          type: "line",
          paint: {
            "line-color": "#00ff87",
            "line-width": 3
          }
        },
        {
          id: "gl-draw-line",
          type: "line",
          paint: {
            "line-color": "#00ff87",
            "line-width": 2
          }
        },
        {
          id: "gl-draw-point",
          type: "circle",
          paint: {
            "circle-radius": 6,
            "circle-color": "#00ff87"
          }
        }
      ]
    });

    map.current.addControl(draw.current);
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("draw.create", () => setHasDrawnBoundary(true));
    map.current.on("draw.update", () => setHasDrawnBoundary(true));
    map.current.on("draw.delete", () => {
      const data = draw.current?.getAll();
      setHasDrawnBoundary(data?.features?.length > 0);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [open]);

  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Please fill in zone name and code");
      return;
    }

    if (!hasDrawnBoundary || !draw.current) {
      toast.error("Please draw a boundary on the map");
      return;
    }

    try {
      const data = draw.current.getAll();
      if (data.features.length === 0) {
        toast.error("Please draw a zone boundary");
        return;
      }

      const polygon = data.features[0];
      
      // Validate boundary before saving
      const { validateZoneBoundary, calculateZoneArea } = await import("@/lib/zoneValidation");
      const validation = validateZoneBoundary(polygon.geometry);
      
      if (!validation.isValid) {
        toast.error("Boundary validation failed");
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => toast.warning(warning));
      }

      const area = calculateZoneArea(polygon.geometry);
      
      // First, insert the zone to get an ID
      const { data: newZone, error: insertError } = await supabase
        .from("zones")
        .insert([{
          name: formData.name,
          code: formData.code,
          households_count: formData.households_count,
          status: "active"
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      if (!newZone) throw new Error("Failed to create zone");

      // Now update the boundary using the zone ID
      const geoJsonString = JSON.stringify(polygon.geometry);
      
      // @ts-ignore - Function exists in DB
      const { error: boundaryError } = await supabase.rpc("update_zone_boundary", {
        zone_id: newZone.id,
        boundary_geojson: geoJsonString
      });

      if (boundaryError) throw boundaryError;

      toast.success(`Zone created successfully with boundary! Area: ${area?.toFixed(2)} km²`);
      setFormData({ name: "", code: "", households_count: 0 });
      setHasDrawnBoundary(false);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create zone");
      console.error("Zone creation error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Create New Collection Zone
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Draw zone boundaries and configure details</p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Form Section */}
          <div className="space-y-4">
            <div>
              <Label>Zone Name *</Label>
              <Input
                placeholder="e.g., Downtown District"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Zone Code *</Label>
              <Input
                placeholder="e.g., ZONE-E"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
            
            <div>
              <Label>Estimated Households</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.households_count}
                onChange={(e) => setFormData({ ...formData, households_count: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <p className="text-sm text-muted-foreground mb-2">
                <strong className="text-primary">Drawing Instructions:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Click the polygon tool on the map</li>
                <li>Click points to create the zone boundary</li>
                <li>Close the polygon by clicking the first point</li>
                <li>Use trash icon to delete and redraw</li>
              </ul>
            </div>

            {hasDrawnBoundary && (
              <div className="p-3 rounded-lg border border-primary bg-primary/10">
                <p className="text-sm font-medium text-primary">
                  ✓ Boundary drawn successfully
                </p>
              </div>
            )}

            <Button 
              onClick={handleCreate} 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!formData.name || !formData.code}
            >
              <Save className="w-4 h-4 mr-2" />
              Create Zone
            </Button>
          </div>

          {/* Map Section */}
          <div className="relative rounded-lg overflow-hidden border-2 border-border">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};