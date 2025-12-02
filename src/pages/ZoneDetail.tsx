import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Users, TrendingUp, Save, Edit2, Plus } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useZoneStats } from "@/hooks/useZones";
import { useHouseholds } from "@/hooks/useHouseholds";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { HouseholdAddDialog } from "@/components/zones/HouseholdAddDialog";
import { HouseholdList } from "@/components/zones/HouseholdList";
import { NotificationCreateDialog } from "@/components/zones/NotificationCreateDialog";
import { NotificationList } from "@/components/zones/NotificationList";
import { TrashIslandDialog } from "@/components/zones/TrashIslandDialog";
import { TrashIslandList } from "@/components/zones/TrashIslandList";
import { useCollectionPoints } from "@/hooks/useCollectionPoints";

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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [addHouseholdOpen, setAddHouseholdOpen] = useState(false);
  const [addNotificationOpen, setAddNotificationOpen] = useState(false);
  const [addTrashIslandOpen, setAddTrashIslandOpen] = useState(false);
  const { data: households } = useHouseholds(zoneId);
  const { data: collectionPoints } = useCollectionPoints(zoneId);

  useEffect(() => {
    // Wait until stats are loaded and the map container exists
    if (isLoading || !stats) return;
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    const mapInstance = new mapboxgl.Map({
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

    map.current = mapInstance;

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
        },
        {
          id: "gl-draw-polygon-fill-active",
          type: "fill",
          paint: {
            "fill-color": "#00ff87",
            "fill-opacity": 0.3
          }
        },
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          paint: {
            "line-color": "#00ff87",
            "line-width": 3
          }
        }
      ]
    });

    mapInstance.addControl(draw.current);
    
    // Hide draw controls initially
    setTimeout(() => {
      const container = document.querySelector('.mapboxgl-ctrl-top-left');
      if (container) {
        container.classList.add('hidden');
      }
    }, 100);

    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Mark map as loaded and then load existing boundary once style is ready
    mapInstance.on('load', () => {
      setMapLoaded(true);
      loadZoneBoundary();
      loadHouseholdMarkers();
      loadCollectionPointMarkers();
    });

    // Listen for draw events
    mapInstance.on("draw.create", () => setHasUnsavedChanges(true));
    mapInstance.on("draw.update", () => setHasUnsavedChanges(true));
    mapInstance.on("draw.delete", () => setHasUnsavedChanges(true));

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isLoading, stats, zoneId]);

  const loadHouseholdMarkers = () => {
    if (!map.current || !households) return;

    households.forEach((household) => {
      if (!household.location) return;

      const raw = typeof household.location === "string"
        ? JSON.parse(household.location)
        : household.location;

      if (raw && raw.type === "Point" && raw.coordinates) {
        const [lng, lat] = raw.coordinates;

        const marker = new mapboxgl.Marker({ color: "#00ff87" })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <p class="font-bold text-sm">${household.address}</p>
                ${household.contact_name ? `<p class="text-xs text-muted-foreground">${household.contact_name}</p>` : ""}
                <p class="text-xs text-primary font-mono mt-1">${household.participation_rate}% participation</p>
              </div>
            `)
          )
          .addTo(map.current);
      }
    });
  };

  const loadCollectionPointMarkers = () => {
    if (!map.current || !collectionPoints) return;

    collectionPoints.forEach((point) => {
      if (!point.location) return;

      const raw = typeof point.location === "string"
        ? JSON.parse(point.location)
        : point.location;

      if (raw && raw.type === "Point" && raw.coordinates) {
        const [lng, lat] = raw.coordinates;

        const el = document.createElement('div');
        el.className = 'trash-island-marker';
        el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTIiIGZpbGw9IiNmZjAwNjYiLz4KPHBhdGggZD0iTTEwIDEySDIwVjE5SDEwVjEyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+)';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundSize = 'contain';

        new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <p class="font-bold text-sm text-primary">🗑️ ${point.name}</p>
                <p class="text-xs text-muted-foreground mt-1">Capacity: ${point.current_bins}/${point.capacity} bins</p>
                <p class="text-xs text-muted-foreground">Status: ${point.status}</p>
              </div>
            `)
          )
          .addTo(map.current);
      }
    });
  };

  useEffect(() => {
    loadHouseholdMarkers();
    loadCollectionPointMarkers();
  }, [households, collectionPoints]);

  const loadZoneBoundary = async () => {
    if (!zoneId || !draw.current) return;

    try {
      const { data, error } = await supabase
        .from("zones")
        .select("boundary")
        .eq("id", zoneId)
        .single();

      if (error) {
        console.error("Error loading zone:", error);
        return;
      }

      if (data?.boundary && draw.current) {
        const raw = typeof data.boundary === "string" 
          ? JSON.parse(data.boundary) 
          : data.boundary;

        // Normalize to pure GeoJSON geometry (MapboxDraw doesn't like extra props like `crs`)
        const geometry = raw && raw.type && raw.coordinates
          ? { type: raw.type, coordinates: raw.coordinates }
          : null;

        if (geometry) {
          draw.current.add({
            type: "Feature",
            properties: {},
            geometry,
          });
        }
      }
    } catch (error) {
      console.error("Error loading boundary:", error);
      toast.error("Could not load zone boundary");
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
      
      // Update zone boundary - convert GeoJSON to PostGIS geometry
      const geoJsonString = JSON.stringify(polygon.geometry);
      
      // @ts-ignore - Function exists in DB but types not yet regenerated
      const { error } = await supabase.rpc("update_zone_boundary", {
        zone_id: zoneId,
        boundary_geojson: geoJsonString
      });

      if (error) throw error;

      toast.success(`Zone boundary saved successfully (${area?.toFixed(2)} km²)`);
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
        if (draw.current) {
          // Hide controls when exiting edit mode
          draw.current.changeMode('simple_select');
          const container = document.querySelector('.mapboxgl-ctrl-top-left');
          if (container) {
            container.classList.add('hidden');
          }
        }
      }
    } else {
      setIsEditing(!isEditing);
      if (!isEditing && draw.current) {
        // Show controls when entering edit mode
        const container = document.querySelector('.mapboxgl-ctrl-top-left');
        if (container) {
          container.classList.remove('hidden');
        }
        
        // Enable direct_select mode to allow editing existing boundary
        const features = draw.current.getAll();
        if (features.features.length > 0) {
          const featureId = features.features[0].id;
          draw.current.changeMode('direct_select', { featureId });
          toast.info("Click and drag vertices to edit the boundary");
        } else {
          draw.current.changeMode('draw_polygon');
          toast.info("Draw the zone boundary on the map");
        }
      } else if (isEditing && draw.current) {
        // Hide controls when toggling off
        const container = document.querySelector('.mapboxgl-ctrl-top-left');
        if (container) {
          container.classList.add('hidden');
        }
      }
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

        {/* Tabs */}
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4 mb-6">
            <TabsTrigger value="map">Zone Map</TabsTrigger>
            <TabsTrigger value="households">Households ({stats.households})</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="islands">Trash Islands</TabsTrigger>
          </TabsList>

          <TabsContent value="map">
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
        <Card className="glass border-2 border-border overflow-hidden relative" style={{ height: '600px' }}>
          <div ref={mapContainer} className="absolute inset-0" />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          )}
          {isEditing && (
            <div className="absolute top-4 left-4 right-4 p-4 border border-primary/30 bg-primary/10 backdrop-blur-sm rounded-lg z-10">
              <p className="text-sm text-foreground font-medium">
                <strong className="text-primary">✏️ Editing Mode Active</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click and drag the boundary vertices to adjust the zone shape. Use the controls in the top-left to draw a new boundary or delete the existing one.
              </p>
            </div>
          )}
        </Card>
          </TabsContent>

          <TabsContent value="households">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display text-primary">Registered Households</h2>
                <p className="text-sm text-muted-foreground">Manage households in this collection zone</p>
              </div>
              <Button onClick={() => setAddHouseholdOpen(true)} className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Household
              </Button>
            </div>
            <HouseholdList zoneId={zoneId!} />
          </TabsContent>

          <TabsContent value="notifications">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display text-primary">Zone Notifications</h2>
                <p className="text-sm text-muted-foreground">Send collection reminders and alerts to households</p>
              </div>
              <Button onClick={() => setAddNotificationOpen(true)} className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Notification
              </Button>
            </div>
            <NotificationList zoneId={zoneId!} />
          </TabsContent>

          <TabsContent value="islands">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display text-primary">Trash Islands</h2>
                <p className="text-sm text-muted-foreground">Centralized collection points for multiple bins</p>
              </div>
              <Button onClick={() => setAddTrashIslandOpen(true)} className="bg-primary">
                <Plus className="w-4 w-4 mr-2" />
                Create Trash Island
              </Button>
            </div>
            <TrashIslandList zoneId={zoneId!} />
          </TabsContent>
        </Tabs>

        <HouseholdAddDialog
          open={addHouseholdOpen}
          onOpenChange={setAddHouseholdOpen}
          zoneId={zoneId!}
          zoneBoundary={stats?.zone.boundary}
        />
        
        <NotificationCreateDialog
          open={addNotificationOpen}
          onOpenChange={setAddNotificationOpen}
          zoneId={zoneId!}
        />

        <TrashIslandDialog
          open={addTrashIslandOpen}
          onOpenChange={setAddTrashIslandOpen}
          zoneId={zoneId!}
          zoneBoundary={stats?.zone.boundary}
        />
      </div>
    </div>
  );
};

export default ZoneDetail;
