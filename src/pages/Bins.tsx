import { useState } from "react";
import { Plus } from "lucide-react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BinList } from "@/components/bins/BinList";
import { BinCreateDialog } from "@/components/bins/BinCreateDialog";
import { useZones } from "@/hooks/useZones";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Bins = () => {
  const [createBinOpen, setCreateBinOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const { data: zones } = useZones();

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display text-primary text-glow-primary mb-2">
              Bin Management
            </h1>
            <p className="text-muted-foreground font-mono">
              Deploy and manage collection bins
            </p>
          </div>
          
          <Button onClick={() => setCreateBinOpen(true)} className="bg-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Bin
          </Button>
        </div>

        <div className="mb-6">
          <Label>Filter by Zone</Label>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones?.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name} ({zone.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <BinList zoneId={selectedZone === "all" ? undefined : selectedZone} />

        {selectedZone !== "all" && (
          <BinCreateDialog
            open={createBinOpen}
            onOpenChange={setCreateBinOpen}
            zoneId={selectedZone}
          />
        )}
      </div>
    </div>
  );
};

export default Bins;
