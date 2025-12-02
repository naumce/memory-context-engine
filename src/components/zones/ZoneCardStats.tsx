import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

interface ZoneCardStatsProps {
  zoneId: string;
}

export const ZoneCardStats = ({ zoneId }: ZoneCardStatsProps) => {
  const { data: collectionPoints } = useQuery({
    queryKey: ["collection-points-count", zoneId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_points")
        .select("id")
        .eq("zone_id", zoneId);
      
      if (error) throw error;
      return data;
    },
  });
  
  const trashIslandsCount = collectionPoints?.length || 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>Trash Islands</span>
      </div>
      <span className="font-mono font-semibold">{trashIslandsCount}</span>
    </div>
  );
};
