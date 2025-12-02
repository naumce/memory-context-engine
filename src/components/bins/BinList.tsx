import { useBins, useDeleteBin } from "@/hooks/useBins";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, QrCode, Home, MapPin } from "lucide-react";

interface BinListProps {
  zoneId?: string;
}

export const BinList = ({ zoneId }: BinListProps) => {
  const { data: bins, isLoading } = useBins({ zoneId });
  const deleteBin = useDeleteBin();

  const getBinTypeColor = (type: string) => {
    switch (type) {
      case "general": return "default";
      case "recycling": return "secondary";
      case "organic": return "outline";
      default: return "default";
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this bin?")) {
      await deleteBin.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading bins...</div>;
  }

  if (!bins || bins.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No bins created yet</p>
        <p className="text-sm">Create bins and assign them to households or trash islands</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bins.map((bin: any) => (
        <Card key={bin.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={getBinTypeColor(bin.bin_type)}>
                  {bin.bin_type}
                </Badge>
                <Badge variant={bin.status === "active" ? "default" : "outline"}>
                  {bin.status}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(bin.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <QrCode className="h-4 w-4 text-primary" />
              <span className="font-mono text-primary">{bin.qr_code}</span>
            </div>

            {bin.households && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                <span>{bin.households.address}</span>
              </div>
            )}

            {bin.collection_points && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{bin.collection_points.name}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Fill: {bin.fill_level || 0}%</span>
              {bin.last_collection && (
                <span>Last: {new Date(bin.last_collection).toLocaleDateString()}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
