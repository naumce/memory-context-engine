import { useState } from "react";
import { Plus, Trash, QrCode, MapPin, AlertCircle } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Bins = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    household_id: "",
    bin_type: "organic",
    qr_code: "",
    fill_level: 0,
    status: "active"
  });

  const { data: bins, isLoading } = useQuery({
    queryKey: ["bins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bins")
        .select(`
          *,
          households!inner(
            address,
            zones!inner(name, code)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: households } = useQuery({
    queryKey: ["households-for-bins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("households")
        .select("id, address, zones!inner(name, code)")
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
  });

  const handleCreateBin = async () => {
    if (!formData.household_id) {
      toast.error("Please select a household");
      return;
    }

    // Generate QR code if not provided
    const qrCode = formData.qr_code || `BIN-${Date.now()}`;

    try {
      const { error } = await supabase
        .from("bins")
        .insert([{ ...formData, qr_code: qrCode }]);

      if (error) throw error;

      toast.success("Bin deployed successfully");
      setIsDialogOpen(false);
      setFormData({
        household_id: "",
        bin_type: "organic",
        qr_code: "",
        fill_level: 0,
        status: "active"
      });
      queryClient.invalidateQueries({ queryKey: ["bins"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getBinColor = (type: string) => {
    const colors: Record<string, string> = {
      organic: "bg-green-500/20 text-green-500 border-green-500/50",
      plastic: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
      paper: "bg-blue-500/20 text-blue-500 border-blue-500/50",
      glass: "bg-purple-500/20 text-purple-500 border-purple-500/50",
      mixed: "bg-gray-500/20 text-gray-500 border-gray-500/50"
    };
    return colors[type] || colors.mixed;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading bins...</p>
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
              Bin Deployment
            </h1>
            <p className="text-muted-foreground font-mono">
              Total Bins Deployed: {bins?.length || 0}
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Deploy New Bin
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Deploy New Bin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Household</Label>
                  <Select value={formData.household_id} onValueChange={(value) => setFormData({ ...formData, household_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select household" />
                    </SelectTrigger>
                    <SelectContent>
                      {households?.map((household) => (
                        <SelectItem key={household.id} value={household.id}>
                          {household.address} ({household.zones.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bin Type</Label>
                  <Select value={formData.bin_type} onValueChange={(value) => setFormData({ ...formData, bin_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organic">Organic Waste</SelectItem>
                      <SelectItem value="plastic">Plastic & Metal</SelectItem>
                      <SelectItem value="paper">Paper & Cardboard</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="mixed">Mixed Waste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>QR Code (Optional)</Label>
                  <Input
                    placeholder="Auto-generated if empty"
                    value={formData.qr_code}
                    onChange={(e) => setFormData({ ...formData, qr_code: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateBin} className="w-full">
                  Deploy Bin
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bins?.map((bin) => (
            <Card key={bin.id} className="glass border-2 border-border p-4">
              <div className="flex items-start justify-between mb-3">
                <Badge className={getBinColor(bin.bin_type)}>
                  {bin.bin_type.toUpperCase()}
                </Badge>
                {(bin.fill_level || 0) > 80 && (
                  <AlertCircle className="w-4 h-4 text-warning" />
                )}
              </div>

              <div className="space-y-2 text-xs mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{bin.households.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <QrCode className="w-3 h-3" />
                  <span className="font-mono">{bin.qr_code}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-muted-foreground">Fill Level</span>
                  <span className="font-mono font-semibold">{bin.fill_level || 0}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${bin.fill_level || 0}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Zone: {bin.households.zones.code}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bins;
