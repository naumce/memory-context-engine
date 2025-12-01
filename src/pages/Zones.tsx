import { useState } from "react";
import { Plus, MapPin, Users, Trash2, Edit, TrendingUp, Activity } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useZones } from "@/hooks/useZones";
import { useZonePerformance } from "@/hooks/useZonePerformance";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Zones = () => {
  const { data: zones, isLoading } = useZones();
  const { data: performance } = useZonePerformance();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    households_count: 0,
    status: "active"
  });

  const handleCreateZone = async () => {
    try {
      const { error } = await supabase
        .from("zones")
        .insert([formData]);

      if (error) throw error;

      toast.success("Zone created successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", code: "", households_count: 0, status: "active" });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    } catch (error: any) {
      toast.error(error.message);
    }
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create New Zone
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Create New Collection Zone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Zone Name</Label>
                  <Input
                    placeholder="e.g., Downtown District"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Zone Code</Label>
                  <Input
                    placeholder="e.g., ZONE-E"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                <Button onClick={handleCreateZone} className="w-full">
                  Create Zone
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
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

                <div className="mt-4 pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = `/admin/zones/${zone.id}/analyze`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analyze Zone
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Zones;
