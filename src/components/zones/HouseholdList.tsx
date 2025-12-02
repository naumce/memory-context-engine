import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User, Phone, MapPin, TrendingUp } from "lucide-react";
import { useHouseholds, useDeleteHousehold, type Household } from "@/hooks/useHouseholds";
import { Badge } from "@/components/ui/badge";

interface HouseholdListProps {
  zoneId: string;
  onEdit?: (household: Household) => void;
}

export const HouseholdList = ({ zoneId, onEdit }: HouseholdListProps) => {
  const { data: households, isLoading } = useHouseholds(zoneId);
  const deleteHousehold = useDeleteHousehold();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this household?")) return;
    await deleteHousehold.mutateAsync({ id, zoneId });
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading households...</p>;
  }

  if (!households || households.length === 0) {
    return (
      <Card className="glass border-2 border-border p-8 text-center">
        <p className="text-muted-foreground mb-2">No households added yet</p>
        <p className="text-sm text-muted-foreground">Click "Add Household" to register households in this zone</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {households.map((household) => (
        <Card key={household.id} className="glass border-2 border-border p-4 hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between mb-3">
            <Badge variant={household.status === "active" ? "default" : "secondary"}>
              {household.status}
            </Badge>
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => onEdit(household)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive"
                onClick={() => handleDelete(household.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{household.address}</p>
            </div>

            {household.contact_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{household.contact_name}</span>
              </div>
            )}

            {household.contact_phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span>{household.contact_phone}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono font-semibold">
                {household.participation_rate}% participation
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
