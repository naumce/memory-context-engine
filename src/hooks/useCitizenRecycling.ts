import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCitizenRecyclingStats = (userId?: string) => {
  return useQuery({
    queryKey: ["citizen-recycling-stats", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("citizen_recycling_logs")
        .select("*")
        .eq("citizen_user_id", userId!)
        .order("logged_at", { ascending: false });
      if (error) throw error;
      
      const totalWeight = data.reduce((sum, log) => sum + (Number(log.weight_kg) || 0), 0);
      const totalPoints = data.reduce((sum, log) => sum + (log.points_earned || 0), 0);
      const byType: Record<string, number> = {};
      data.forEach((log) => {
        byType[log.waste_type] = (byType[log.waste_type] || 0) + (Number(log.weight_kg) || 0);
      });
      
      return {
        logs: data,
        totalWeight,
        totalPoints,
        totalLogs: data.length,
        byType,
      };
    },
    enabled: !!userId,
  });
};
