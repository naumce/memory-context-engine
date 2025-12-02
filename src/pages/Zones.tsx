import { Plus, MapPin, Users, Trash2, Edit, TrendingUp, Activity, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useZones, type Zone } from "@/hooks/useZones";
import { useZonePerformance } from "@/hooks/useZonePerformance";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ZoneEditDialog } from "@/components/zones/ZoneEditDialog";
import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1Ijoia2Fib20xMSIsImEiOiJjbWE0NnU5NXUwMzF2MnFxdTQxMmFtbHA0In0.LMMt9w1PlrlQCL3WU5lp9Q";

const Zones = () => {
  const navigate = useNavigate();
  const { data: zones, isLoading } = useZones();
  const { data: performance } = useZonePerformance();
  const queryClient = useQueryClient();
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // Only initialize map when Map View tab is active
    if (activeTab === "map" && !map.current && mapContainer.current && zones && zones.length > 0) {
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

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on('load', () => {
        loadZoneBoundaries();
      });
    }

    // Cleanup when switching away from map tab
    if (activeTab !== "map" && map.current) {
      map.current.remove();
      map.current = null;
    }
  }, [zones, activeTab]);

  const loadZoneBoundaries = async () => {
    if (!map.current || !zones) return;

    zones.forEach(async (zone) => {
      if (zone.boundary) {
        const geoJson = typeof zone.boundary === 'string' 
          ? JSON.parse(zone.boundary) 
          : zone.boundary;

        const sourceId = `zone-${zone.id}`;
        
        if (map.current?.getSource(sourceId)) {
          return;
        }

        map.current?.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              name: zone.name,
              code: zone.code
            },
            geometry: geoJson
          }
        });

        map.current?.addLayer({
          id: `${sourceId}-fill`,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#00ff87',
            'fill-opacity': 0.2
          }
        });

        map.current?.addLayer({
          id: `${sourceId}-line`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#00ff87',
            'line-width': 2
          }
        });

        // Add popup on click
        map.current?.on('click', `${sourceId}-fill`, (e) => {
          if (e.features && e.features[0]) {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold">${zone.name}</h3>
                  <p class="text-sm">${zone.code}</p>
                  <p class="text-xs text-muted-foreground">${zone.households_count} households</p>
                </div>
              `)
              .addTo(map.current!);
          }
        });

        // Change cursor on hover
        map.current?.on('mouseenter', `${sourceId}-fill`, () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current?.on('mouseleave', `${sourceId}-fill`, () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      }
    });
  };

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone);
    setEditDialogOpen(true);
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;

    try {
      const { error } = await supabase
        .from("zones")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Zone deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getPerformanceData = (zoneId: string) => {
    return performance?.find(p => p.zoneId === zoneId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading zones...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display text-primary text-glow-primary mb-2">
              Zone Management
            </h1>
            <p className="text-muted-foreground font-mono">Struga Municipality Collection Zones</p>
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate("/admin/zones/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Zone
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="grid">
              <MapPin className="w-4 h-4 mr-2" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapIcon className="w-4 h-4 mr-2" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            {/* Zone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zones?.map((zone) => {
                const perfData = getPerformanceData(zone.id);
                const participation = perfData?.participationRate || 0;
                
                return (
                  <Card key={zone.id} className="glass border-2 border-border p-6 hover:border-primary/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg">{zone.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{zone.code}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditZone(zone)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteZone(zone.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>Households</span>
                        </div>
                        <span className="font-mono font-semibold">{zone.households_count}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="w-4 h-4" />
                          <span>Participation</span>
                        </div>
                        <span className="font-mono font-semibold">{participation}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span>Collected Today</span>
                        </div>
                        <span className="font-mono font-semibold">{perfData?.collectedToday || 0} tons</span>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Next Collection</p>
                        <p className="text-sm font-mono">{perfData?.nextCollection || "Not scheduled"}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.location.href = `/admin/zones/${zone.id}/analyze`}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Analyze
                      </Button>
                      <Button 
                        variant="default" 
                        className="flex-1 bg-primary"
                        onClick={() => window.location.href = `/admin/zones/${zone.id}/operations`}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        Operations
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <Card className="glass border-2 border-border overflow-hidden" style={{ height: '70vh' }}>
              <div ref={mapContainer} className="w-full h-full" />
            </Card>
            <div className="mt-4 p-4 glass border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-primary">Interactive Map:</strong> Click on any zone boundary to view details. 
                All {zones?.length || 0} zones are displayed with their boundaries.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <ZoneEditDialog
          zone={editingZone}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["zones"] });
            setEditingZone(null);
          }}
        />
      </div>
    </div>
  );
};

export default Zones;
