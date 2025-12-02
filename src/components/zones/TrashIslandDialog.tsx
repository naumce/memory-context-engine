import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddCollectionPoint } from "@/hooks/useCollectionPoints";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1Ijoia2Fib20xMSIsImEiOiJjbWE0NnU5NXUwMzF2MnFxdTQxMmFtbHA0In0.LMMt9w1PlrlQCL3WU5lp9Q";

interface TrashIslandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zoneId: string;
  zoneBoundary?: any;
}

export const TrashIslandDialog = ({ open, onOpenChange, zoneId, zoneBoundary }: TrashIslandDialogProps) => {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<{ lng: number; lat: number } | null>(null);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const addCollectionPoint = useAddCollectionPoint();

  useEffect(() => {
    if (!open || !mapContainer.current) return;
    
    // Clean up existing map if any
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    // Small delay to ensure DOM is ready
    const initMap = setTimeout(() => {
      if (!mapContainer.current) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [20.6783, 41.1781],
        zoom: 14,
        maxBounds: [[20.6, 41.15], [20.75, 41.21]],
      });

      map.current = mapInstance;

    // Add zone boundary if available
    mapInstance.on('load', () => {
      if (zoneBoundary) {
        const raw = typeof zoneBoundary === "string" ? JSON.parse(zoneBoundary) : zoneBoundary;
        const geometry = raw && raw.type && raw.coordinates
          ? { type: raw.type, coordinates: raw.coordinates }
          : null;

        if (geometry) {
          mapInstance.addSource('zone-boundary', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry,
            },
          });

          mapInstance.addLayer({
            id: 'zone-boundary-fill',
            type: 'fill',
            source: 'zone-boundary',
            paint: {
              'fill-color': '#00ff87',
              'fill-opacity': 0.1,
            },
          });

          mapInstance.addLayer({
            id: 'zone-boundary-line',
            type: 'line',
            source: 'zone-boundary',
            paint: {
              'line-color': '#00ff87',
              'line-width': 2,
            },
          });
        }
      }
    });


      // Click to place marker
      mapInstance.on('click', (e) => {
        if (marker.current) {
          marker.current.remove();
        }

        marker.current = new mapboxgl.Marker({ color: '#ff0066' })
          .setLngLat(e.lngLat)
          .addTo(mapInstance);

        setLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      });
    }, 100);

    return () => {
      clearTimeout(initMap);
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [open, zoneBoundary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      return;
    }

    const locationGeoJSON = {
      type: "Point",
      coordinates: [location.lng, location.lat],
    };

    await addCollectionPoint.mutateAsync({
      zone_id: zoneId,
      name,
      location: JSON.stringify(locationGeoJSON) as any,
      point_type: "island",
      capacity,
      status: "active",
      notes: notes || null,
    });

    setName("");
    setCapacity(10);
    setNotes("");
    setLocation(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Trash Island</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Island Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Street Collection Point"
              required
            />
          </div>

          <div>
            <Label htmlFor="capacity">Bin Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              min={1}
              max={50}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Access instructions, special requirements..."
              rows={2}
            />
          </div>

          <div>
            <Label>Location</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Click on the map to place the trash island marker
            </p>
            <div 
              ref={mapContainer} 
              className="h-[400px] rounded-lg border border-border relative"
              style={{ minHeight: '400px' }}
            />
            {location && (
              <p className="text-xs text-primary mt-2 font-mono">
                Selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!location}>
              Create Trash Island
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
