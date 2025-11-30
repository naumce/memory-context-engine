import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Truck {
  id: string;
  vehicle_id: string;
  license_plate: string;
  type: string;
  status: string;
  battery_level: number;
  current_driver_id: string | null;
  current_zone_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TruckWithDetails extends Truck {
  driver?: {
    full_name: string;
    phone: string;
  };
  zone?: {
    name: string;
    code: string;
  };
}

export const useTrucks = () => {
  return useQuery({
    queryKey: ["trucks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trucks")
        .select("*")
        .order("vehicle_id");
      
      if (error) {
        console.error("Error fetching trucks:", error);
        throw error;
      }
      
      // Fetch related data separately
      const trucksWithDetails = await Promise.all(
        (data || []).map(async (truck) => {
          let driver = undefined;
          let zone = undefined;
          
          if (truck.current_driver_id) {
            const { data: driverData } = await supabase
              .from("drivers")
              .select("full_name, phone")
              .eq("id", truck.current_driver_id)
              .single();
            driver = driverData || undefined;
          }
          
          if (truck.current_zone_id) {
            const { data: zoneData } = await supabase
              .from("zones")
              .select("name, code")
              .eq("id", truck.current_zone_id)
              .single();
            zone = zoneData || undefined;
          }
          
          return { ...truck, driver, zone } as TruckWithDetails;
        })
      );
      
      return trucksWithDetails;
    },
  });
};

export const useActiveTrucks = () => {
  return useQuery({
    queryKey: ["active-trucks"],
    queryFn: async () => {
      console.log("Fetching active trucks...");
      const { data: allTrucks, error: allError } = await supabase
        .from("trucks")
        .select("id, status");

      if (allError) {
        console.error("Error fetching trucks:", allError);
        throw allError;
      }

      console.log("All trucks:", allTrucks);
      const active = allTrucks?.filter(t => t.status === "active").length || 0;
      const total = allTrucks?.length || 0;

      console.log("Active trucks:", active, "Total:", total);
      return { active, total };
    },
  });
};
