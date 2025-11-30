import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Zone {
  id: string;
  name: string;
  code: string;
  status: string;
  households_count: number;
  created_at: string;
  updated_at: string;
}

export const useZones = () => {
  return useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .order("code");
      
      if (error) throw error;
      return data as Zone[];
    },
  });
};

export const useZoneStats = (zoneId?: string) => {
  return useQuery({
    queryKey: ["zone-stats", zoneId],
    queryFn: async () => {
      if (!zoneId) return null;

      // Get zone info
      const { data: zone, error: zoneError } = await supabase
        .from("zones")
        .select("*")
        .eq("id", zoneId)
        .single();

      if (zoneError) throw zoneError;

      // Get households in zone
      const { data: households, error: householdsError } = await supabase
        .from("households")
        .select("*")
        .eq("zone_id", zoneId);

      if (householdsError) throw householdsError;

      // Calculate participation rate
      const activeHouseholds = households?.filter(h => h.status === "active").length || 0;
      const totalHouseholds = households?.length || 0;
      const participationRate = totalHouseholds > 0 
        ? Math.round((activeHouseholds / totalHouseholds) * 100) 
        : 0;

      // Calculate average participation score
      const avgParticipation = households?.reduce((sum, h) => sum + (h.participation_rate || 0), 0) / (households?.length || 1);

      return {
        zone,
        households: totalHouseholds,
        activeHouseholds,
        participationRate,
        avgParticipation: Math.round(avgParticipation),
      };
    },
    enabled: !!zoneId,
  });
};
