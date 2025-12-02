import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Household {
  id: string;
  zone_id: string;
  address: string;
  contact_name: string | null;
  contact_phone: string | null;
  status: string;
  participation_rate: number;
  location: any;
  created_at: string;
  updated_at: string;
}

export const useHouseholds = (zoneId?: string) => {
  return useQuery({
    queryKey: ["households", zoneId],
    queryFn: async () => {
      let query = supabase
        .from("households")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (zoneId) {
        query = query.eq("zone_id", zoneId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Household[];
    },
    enabled: !!zoneId,
  });
};

export const useAddHousehold = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (household: Omit<Household, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("households")
        .insert([household])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["households", variables.zone_id] });
      queryClient.invalidateQueries({ queryKey: ["zone-stats", variables.zone_id] });
      toast.success("Household added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add household");
    },
  });
};

export const useUpdateHousehold = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Household> }) => {
      const { data, error } = await supabase
        .from("households")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["households", data.zone_id] });
      queryClient.invalidateQueries({ queryKey: ["zone-stats", data.zone_id] });
      toast.success("Household updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update household");
    },
  });
};

export const useDeleteHousehold = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, zoneId }: { id: string; zoneId: string }) => {
      const { error } = await supabase
        .from("households")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { id, zoneId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["households", data.zoneId] });
      queryClient.invalidateQueries({ queryKey: ["zone-stats", data.zoneId] });
      toast.success("Household deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete household");
    },
  });
};
