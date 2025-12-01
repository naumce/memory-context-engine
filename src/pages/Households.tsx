import { useState } from "react";
import { Plus, Home, MapPin, Phone, User, Trash2, Edit } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useZones } from "@/hooks/useZones";

const Households = () => {
  const queryClient = useQueryClient();
  const { data: zones } = useZones();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    contact_name: "",
    contact_phone: "",
    zone_id: "",
    status: "active",
    participation_rate: 0
  });

  const { data: households, isLoading } = useQuery({
    queryKey: ["households"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("households")
        .select(`
          *,
          zones!inner(name, code)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleCreateHousehold = async () => {
    if (!formData.zone_id) {
      toast.error("Please select a zone");
      return;
    }

    try {
      const { error } = await supabase
        .from("households")
        .insert([formData]);

      if (error) throw error;

      toast.success("Household registered successfully");
      setIsDialogOpen(false);
      setFormData({
        address: "",
        contact_name: "",
        contact_phone: "",
        zone_id: "",
        status: "active",
        participation_rate: 0
      });
      queryClient.invalidateQueries({ queryKey: ["households"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteHousehold = async (id: string) => {
    if (!confirm("Are you sure you want to remove this household?")) return;

    try {
      const { error } = await supabase
        .from("households")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Household removed successfully");
      queryClient.invalidateQueries({ queryKey: ["households"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading households...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display text-primary text-glow-primary mb-2">
              Household Management
            </h1>
            <p className="text-muted-foreground font-mono">
              Registered Households: {households?.length || 0}
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Register Household
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Register New Household</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Address</Label>
                  <Input
                    placeholder="Street address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Zone</Label>
                  <Select value={formData.zone_id} onValueChange={(value) => setFormData({ ...formData, zone_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones?.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} ({zone.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Contact Name</Label>
                  <Input
                    placeholder="Full name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    placeholder="+389..."
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateHousehold} className="w-full">
                  Register Household
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {households?.map((household) => (
            <Card key={household.id} className="glass border-2 border-border p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Home className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{household.address}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {household.zones.code}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => handleDeleteHousehold(household.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {household.contact_name && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{household.contact_name}</span>
                  </div>
                )}
                {household.contact_phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{household.contact_phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{household.zones.name}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Participation Rate</span>
                  <span className="font-mono font-semibold">{household.participation_rate || 0}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Households;
