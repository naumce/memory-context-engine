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
        .select(`
          *,
          driver:drivers(full_name, phone),
          zone:zones(name, code)
        `)
        .order("vehicle_id");
      
      if (error) throw error;
      return data as TruckWithDetails[];
    },
  });
};

export const useActiveTrucks = () => {
  return useQuery({
    queryKey: ["active-trucks"],
    queryFn: async () => {
      const { data: allTrucks, error: allError } = await supabase
        .from("trucks")
        .select("id, status");

      if (allError) throw allError;

      const active = allTrucks?.filter(t => t.status === "active").length || 0;
      const total = allTrucks?.length || 0;

      return { active, total };
    },
  });
};
