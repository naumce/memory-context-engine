import { useCollectionPoints, useDeleteCollectionPoint } from "@/hooks/useCollectionPoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Package } from "lucide-react";

interface TrashIslandListProps {
  zoneId: string;
}

export const TrashIslandList = ({ zoneId }: TrashIslandListProps) => {
  const { data: collectionPoints, isLoading } = useCollectionPoints(zoneId);
  const deleteCollectionPoint = useDeleteCollectionPoint();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this trash island?")) {
      await deleteCollectionPoint.mutateAsync({ id, zoneId });
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading trash islands...</div>;
  }

  if (!collectionPoints || collectionPoints.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No trash islands yet</p>
        <p className="text-sm">Create collection points for centralized waste management</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {collectionPoints.map((point) => (
        <Card key={point.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{point.name}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(point.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant={point.status === "active" ? "default" : "outline"}>
                {point.status}
              </Badge>
              <Badge variant="secondary">
                {point.point_type}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-primary" />
              <span className="font-mono">
                {point.current_bins} / {point.capacity} bins
              </span>
            </div>

            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${(point.current_bins / point.capacity) * 100}%` }}
              />
            </div>

            {point.notes && (
              <p className="text-xs text-muted-foreground border-t pt-2">
                {point.notes}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
