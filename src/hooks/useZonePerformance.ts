import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useZonePerformance = () => {
  return useQuery({
    queryKey: ["zones-performance"],
    queryFn: async () => {
      // Get all zones with their household data
      const { data: zones, error: zonesError } = await supabase
        .from("zones")
        .select("id, code, name");

      if (zonesError) throw zonesError;

      // For each zone, get collections and participation data
      const zonePerformance = await Promise.all(
        (zones || []).map(async (zone) => {
          // Get households in this zone
          const { data: households } = await supabase
            .from("households")
            .select("id, status, participation_rate")
            .eq("zone_id", zone.id);

          // Calculate participation rate
          const totalHouseholds = households?.length || 0;
          const avgParticipation = totalHouseholds > 0
            ? Math.round(
                households.reduce((sum, h) => sum + (h.participation_rate || 0), 0) / totalHouseholds
              )
            : 0;

          // Get today's collections for this zone
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const { data: collections } = await supabase
            .from("collections")
            .select(`
              weight_kg,
              bins!inner(household_id),
              households!inner(zone_id)
            `)
            .eq("households.zone_id", zone.id)
            .gte("collected_at", today.toISOString());

          const collectedToday = collections?.reduce((sum, c) => sum + (c.weight_kg || 0), 0) || 0;

          // Get next scheduled collection (mock for now, would need schedule table)
          const scheduleHours: Record<string, number> = {
            "ZONE-A": 24,
            "ZONE-B": 4,
            "ZONE-C": 8,
            "ZONE-D": 0,
          };
          
          const hoursUntilNext = scheduleHours[zone.code] || 24;
          const nextCollection = hoursUntilNext === 0 
            ? "URGENT" 
            : hoursUntilNext < 24 
              ? `In ${hoursUntilNext} hours`
              : "Tomorrow 08:00";

          return {
            zoneId: zone.id,
            zoneCode: zone.code,
            zoneName: zone.name,
            participationRate: avgParticipation,
            collectedToday: Math.round(collectedToday / 1000 * 10) / 10, // Convert to tons with 1 decimal
            nextCollection,
          };
        })
      );

      return zonePerformance;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
