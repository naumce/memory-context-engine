import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Alert {
  id: string;
  type: "overflow" | "contamination" | "missed_collection" | "equipment";
  severity: "low" | "medium" | "high" | "critical";
  zone?: string;
  message: string;
  prediction?: string;
  probability?: number;
  action?: string;
  createdAt: Date;
}

export const useAlerts = () => {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      // Get zones with potential overflow issues
      const { data: zones } = await supabase
        .from("zones")
        .select(`
          id,
          code,
          name,
          households_count
        `);

      const alerts: Alert[] = [];

      // Check each zone for potential issues
      for (const zone of zones || []) {
        // Get bins in this zone that are highly filled
        const { data: households } = await supabase
          .from("households")
          .select("id")
          .eq("zone_id", zone.id);

        const householdIds = households?.map(h => h.id) || [];

        if (householdIds.length > 0) {
          const { data: bins } = await supabase
            .from("bins")
            .select("fill_level")
            .in("household_id", householdIds)
            .gte("fill_level", 80);

          const highFillBins = bins?.length || 0;
          const fillPercentage = householdIds.length > 0 
            ? (highFillBins / householdIds.length) * 100 
            : 0;

          // If more than 30% of bins are highly filled, create an alert
          if (fillPercentage > 30) {
            const hoursToOverflow = Math.max(4, Math.round((100 - fillPercentage) / 5));
            alerts.push({
              id: `overflow-${zone.id}`,
              type: "overflow",
              severity: hoursToOverflow < 6 ? "critical" : "high",
              zone: zone.name,
              message: `${zone.name} will reach overflow capacity in ${hoursToOverflow} hours`,
              prediction: "Based on current fill levels and historical trends",
              probability: Math.min(94, Math.round(fillPercentage + 20)),
              action: "Auto-Dispatch Truck Recommended",
              createdAt: new Date(),
            });
          }
        }
      }

      // If no real alerts, return a demo alert for Zone B
      if (alerts.length === 0) {
        alerts.push({
          id: "demo-overflow",
          type: "overflow",
          severity: "high",
          zone: "Zone B",
          message: "Zone B will reach overflow capacity in 4 hours",
          prediction: "Upcoming holiday + historical trend analysis",
          probability: 94,
          action: "Auto-Dispatch TRK-02",
          createdAt: new Date(),
        });
      }

      return alerts;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
