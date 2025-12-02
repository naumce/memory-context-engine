import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useZoneStats = (zoneId?: string) => {
  return useQuery({
    queryKey: ["zone-stats", zoneId],
    queryFn: async () => {
      if (!zoneId) throw new Error("Zone ID is required");

      // Fetch zone data
      const { data: zone, error: zoneError } = await supabase
        .from("zones")
        .select("*")
        .eq("id", zoneId)
        .single();

      if (zoneError) throw zoneError;

      // Fetch households count
      const { data: households, error: householdsError } = await supabase
        .from("households")
        .select("id, status")
        .eq("zone_id", zoneId);

      if (householdsError) throw householdsError;

      // Fetch trash islands count
      const { data: collectionPoints, error: pointsError } = await supabase
        .from("collection_points")
        .select("id")
        .eq("zone_id", zoneId);

      if (pointsError) throw pointsError;

      const totalHouseholds = households?.length || 0;
      const activeHouseholds = households?.filter(h => h.status === "active").length || 0;
      const participationRate = totalHouseholds > 0 
        ? Math.round((activeHouseholds / totalHouseholds) * 100) 
        : 0;

      return {
        zone,
        households: totalHouseholds,
        activeHouseholds,
        participationRate,
        trashIslands: collectionPoints?.length || 0,
      };
    },
    enabled: !!zoneId,
  });
};
