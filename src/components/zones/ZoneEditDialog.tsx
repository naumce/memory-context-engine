import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Save, MapPin } from "lucide-react";
import type { Zone } from "@/hooks/useZones";

interface ZoneEditDialogProps {
  zone: Zone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ZoneEditDialog = ({ zone, open, onOpenChange, onSuccess }: ZoneEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "active",
    households_count: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (zone) {
      setFormData({
        name: zone.name,
        code: zone.code,
        status: zone.status,
        households_count: zone.households_count || 0
      });
    }
  }, [zone]);

  const handleSave = async () => {
    if (!zone) return;

    if (!formData.name.trim()) {
      toast.error("Zone name is required");
      return;
    }

    if (!formData.code.trim()) {
      toast.error("Zone code is required");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("zones")
        .update({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          status: formData.status,
          households_count: formData.households_count
        })
        .eq("id", zone.id);

      if (error) throw error;

      toast.success("Zone updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update zone");
      console.error("Zone update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!zone) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Edit Zone Information
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Update zone details</p>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
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
              placeholder="e.g., ZONE-A"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>
          
          <div>
            <Label>Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Households Count</Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.households_count}
              onChange={(e) => setFormData({ ...formData, households_count: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};