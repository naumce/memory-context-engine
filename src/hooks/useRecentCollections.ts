import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRecentCollections = () => {
  return useQuery({
    queryKey: ["recent-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select(`
          *,
          bins!inner(bin_type, household_id),
          trucks!inner(vehicle_id),
          drivers!inner(full_name)
        `)
        .order("collected_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Fallback polling every 30s
  });
};
