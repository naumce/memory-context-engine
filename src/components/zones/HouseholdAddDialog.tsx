import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Save } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAddHousehold } from "@/hooks/useHouseholds";

const MAPBOX_TOKEN = "pk.eyJ1Ijoia2Fib20xMSIsImEiOiJjbWE0NnU5NXUwMzF2MnFxdTQxMmFtbHA0In0.LMMt9w1PlrlQCL3WU5lp9Q";

interface HouseholdAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zoneId: string;
  zoneBoundary?: any;
}

export const HouseholdAddDialog = ({ open, onOpenChange, zoneId, zoneBoundary }: HouseholdAddDialogProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [formData, setFormData] = useState({
    address: "",
    contact_name: "",
    contact_phone: "",
  });

  const addHousehold = useAddHousehold();

  useEffect(() => {
    if (!open || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [20.6783, 41.1781],
      zoom: 14,
      maxBounds: [
        [20.6, 41.15],
        [20.75, 41.21]
      ],
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Display zone boundary if available
    if (zoneBoundary) {
      map.current.on("load", () => {
        const raw = typeof zoneBoundary === "string" ? JSON.parse(zoneBoundary) : zoneBoundary;
        const geometry = raw && raw.type && raw.coordinates ? { type: raw.type, coordinates: raw.coordinates } : null;

        if (geometry && map.current) {
          map.current.addSource("zone-boundary", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry,
            },
          });

          map.current.addLayer({
            id: "zone-fill",
            type: "fill",
            source: "zone-boundary",
            paint: {
              "fill-color": "#00ff87",
              "fill-opacity": 0.1,
            },
          });

          map.current.addLayer({
            id: "zone-line",
            type: "line",
            source: "zone-boundary",
            paint: {
              "line-color": "#00ff87",
              "line-width": 2,
            },
          });
        }
      });
    }

    // Click to place household marker
    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setSelectedLocation([lng, lat]);

      if (marker.current) {
        marker.current.remove();
      }

      marker.current = new mapboxgl.Marker({ color: "#00ff87" })
        .setLngLat([lng, lat])
        .addTo(map.current!);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
    };
  }, [open, zoneBoundary]);

  const handleSubmit = async () => {
    if (!formData.address.trim()) {
      return;
    }

    if (!selectedLocation) {
      return;
    }

    const locationGeoJSON = {
      type: "Point",
      coordinates: selectedLocation,
    };

    await addHousehold.mutateAsync({
      zone_id: zoneId,
      address: formData.address.trim(),
      contact_name: formData.contact_name.trim() || null,
      contact_phone: formData.contact_phone.trim() || null,
      status: "active",
      participation_rate: 0,
      location: JSON.stringify(locationGeoJSON) as any,
    });

    setFormData({ address: "", contact_name: "", contact_phone: "" });
    setSelectedLocation(null);
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Add Household to Zone
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Click on the map to place the household location</p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          <div className="space-y-4">
            <div>
              <Label>Address *</Label>
              <Input
                placeholder="e.g., Ulica Marka Miljanova 12"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <Label>Contact Name</Label>
              <Input
                placeholder="e.g., Petar Petrović"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />
            </div>

            <div>
              <Label>Contact Phone</Label>
              <Input
                placeholder="e.g., +382 69 123 456"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>

            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <p className="text-sm text-muted-foreground mb-2">
                <strong className="text-primary">Location:</strong>
              </p>
              {selectedLocation ? (
                <p className="text-xs font-mono text-primary">
                  ✓ {selectedLocation[1].toFixed(6)}, {selectedLocation[0].toFixed(6)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Click on the map to select location</p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!formData.address || !selectedLocation || addHousehold.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {addHousehold.isPending ? "Adding..." : "Add Household"}
            </Button>
          </div>

          <div className="relative rounded-lg overflow-hidden border-2 border-border">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
