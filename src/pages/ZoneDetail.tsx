import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Users, TrendingUp, Save, Edit2 } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useZoneStats } from "@/hooks/useZones";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

const MAPBOX_TOKEN = "pk.eyJ1Ijoia2Fib20xMSIsImEiOiJjbWE0NnU5NXUwMzF2MnFxdTQxMmFtbHA0In0.LMMt9w1PlrlQCL3WU5lp9Q";

const ZoneDetail = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useZoneStats(zoneId);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [20.6783, 41.1781],
        zoom: 14,
        pitch: 45,
        maxBounds: [
          [20.6, 41.15],
          [20.75, 41.21]
        ],
      });

      // Initialize MapboxDraw for zone boundary editing
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

      // Load existing boundary if available
      loadZoneBoundary();

      // Listen for draw events
      map.current.on("draw.create", () => setHasUnsavedChanges(true));
      map.current.on("draw.update", () => setHasUnsavedChanges(true));
      map.current.on("draw.delete", () => setHasUnsavedChanges(true));
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  const loadZoneBoundary = async () => {
    if (!zoneId || !draw.current) return;

    try {
      const { data, error } = await supabase
        .from("zones")
        .select("boundary")
        .eq("id", zoneId)
        .single();

      if (error) throw error;

      if (data?.boundary) {
        // Convert PostGIS geometry to GeoJSON
        const { data: geoJson, error: geoError } = await supabase.rpc(
          "st_asgeojson",
          { geom: data.boundary }
        );

        if (!geoError && geoJson) {
          draw.current.add(JSON.parse(geoJson));
        }
      }
    } catch (error) {
      console.error("Error loading boundary:", error);
    }
  };

  const handleSaveBoundary = async () => {
    if (!zoneId || !draw.current) return;

    try {
      const data = draw.current.getAll();
      
      if (data.features.length === 0) {
        toast.error("Please draw a zone boundary first");
        return;
      }

      const polygon = data.features[0];
      
      // Update zone boundary - convert GeoJSON to PostGIS geometry
      const geoJsonString = JSON.stringify(polygon.geometry);
      
      // @ts-ignore - Function exists in DB but types not yet regenerated
      const { error } = await supabase.rpc("update_zone_boundary", {
        zone_id: zoneId,
        boundary_geojson: geoJsonString
      });

      if (error) throw error;

      toast.success("Zone boundary saved successfully");
      setHasUnsavedChanges(false);
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save boundary");
    }
  };

  const toggleEditMode = () => {
    if (isEditing && hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Discard them?")) {
        loadZoneBoundary();
        setHasUnsavedChanges(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(!isEditing);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading zone details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin/zones")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-display text-primary text-glow-primary mb-2">
                {stats.zone.name}
              </h1>
              <p className="text-muted-foreground font-mono">{stats.zone.code}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={toggleEditMode}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel Edit" : "Edit Boundary"}
            </Button>
            {hasUnsavedChanges && (
              <Button onClick={handleSaveBoundary} className="bg-primary">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Households</p>
                <p className="text-2xl font-display text-glow-primary">{stats.households}</p>
              </div>
            </div>
          </Card>

          <Card className="glass border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Households</p>
                <p className="text-2xl font-display text-glow-primary">{stats.activeHouseholds}</p>
              </div>
            </div>
          </Card>

          <Card className="glass border-2 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Participation Rate</p>
                <p className="text-2xl font-display text-glow-primary">{stats.participationRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Map */}
        <Card className="glass border-2 border-border overflow-hidden">
          <div ref={mapContainer} className="w-full h-[600px]" />
          {isEditing && (
            <div className="p-4 border-t border-border bg-muted/20">
              <p className="text-sm text-muted-foreground">
                <strong>Editing Mode:</strong> Draw or modify the zone boundary on the map. 
                Click points to create a polygon. Use the trash icon to delete.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ZoneDetail;
