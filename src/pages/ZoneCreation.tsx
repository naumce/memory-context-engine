import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { Save, MapPin, ArrowLeft, Trash2 } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";

const MAPBOX_TOKEN = "pk.eyJ1Ijoia2Fib20xMSIsImEiOiJjbWE0NnU5NXUwMzF2MnFxdTQxMmFtbHA0In0.LMMt9w1PlrlQCL3WU5lp9Q";

const ZoneCreation = () => {
  const navigate = useNavigate();
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
    if (!mapContainer.current || map.current) return;

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
  }, []);

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

      const geoJsonString = JSON.stringify(polygon.geometry);
      
      // @ts-ignore - Function exists in DB
      const { error: boundaryError } = await supabase.rpc("update_zone_boundary", {
        zone_id: newZone.id,
        boundary_geojson: geoJsonString
      });

      if (boundaryError) throw boundaryError;

      toast.success("Zone created successfully with boundary!");
      navigate("/admin/zones");
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error(`Zone code "${formData.code}" already exists. Please use a different code.`);
      } else {
        toast.error(error.message || "Failed to create zone");
      }
      console.error("Zone creation error:", error);
    }
  };

  const handleClearDrawing = () => {
    if (draw.current) {
      draw.current.deleteAll();
      setHasDrawnBoundary(false);
      toast.info("Drawing cleared");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin/zones")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display text-primary text-glow-primary mb-2 flex items-center gap-2">
              <MapPin className="w-8 h-8" />
              Create New Collection Zone
            </h1>
            <p className="text-muted-foreground">Draw zone boundaries on the map and configure zone details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
          {/* Form Section */}
          <Card className="glass p-6 space-y-6 lg:col-span-1 overflow-y-auto h-full">
            <div>
              <Label>Zone Name *</Label>
              <Input
                placeholder="e.g., Downtown District"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Zone Code *</Label>
              <Input
                placeholder="e.g., ZONE-E"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Estimated Households</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.households_count}
                onChange={(e) => setFormData({ ...formData, households_count: parseInt(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>

            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <p className="text-sm font-medium text-primary mb-2">
                Drawing Instructions:
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

            <div className="space-y-3">
              <Button 
                onClick={handleCreate} 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!formData.name || !formData.code || !hasDrawnBoundary}
              >
                <Save className="w-4 h-4 mr-2" />
                Create Zone
              </Button>

              {hasDrawnBoundary && (
                <Button 
                  onClick={handleClearDrawing}
                  variant="outline"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Drawing
                </Button>
              )}
            </div>
          </Card>

          {/* Map Section */}
          <Card className="glass lg:col-span-2 relative overflow-hidden min-h-[400px] lg:h-full p-0">
            <div ref={mapContainer} className="absolute inset-0" />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ZoneCreation;
