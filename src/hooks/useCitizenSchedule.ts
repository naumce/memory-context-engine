import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCitizenSchedule = (zoneId?: string) => {
  return useQuery({
    queryKey: ["citizen-schedule", zoneId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zone_schedules")
        .select("*, trucks(vehicle_id, license_plate)")
        .eq("zone_id", zoneId!)
        .eq("is_active", true)
        .order("day_of_week", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!zoneId,
  });
};

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
