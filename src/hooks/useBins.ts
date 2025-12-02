import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Bin {
  id: string;
  household_id: string | null;
  collection_point_id: string | null;
  bin_type: string;
  qr_code: string;
  status: string;
  fill_level: number | null;
  last_collection: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useBins = (filters?: { householdId?: string; collectionPointId?: string; zoneId?: string }) => {
  return useQuery({
    queryKey: ["bins", filters],
    queryFn: async () => {
      let query = supabase
        .from("bins")
        .select(`
          *,
          households:household_id(address, zone_id),
          collection_points:collection_point_id(name, zone_id)
        `)
        .order("created_at", { ascending: false });
      
      if (filters?.householdId) {
        query = query.eq("household_id", filters.householdId);
      }
      
      if (filters?.collectionPointId) {
        query = query.eq("collection_point_id", filters.collectionPointId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter by zone if needed (since bins don't have direct zone_id)
      if (filters?.zoneId && data) {
        return data.filter((bin: any) => {
          const household = bin.households;
          const collectionPoint = bin.collection_points;
          return (household && household.zone_id === filters.zoneId) ||
                 (collectionPoint && collectionPoint.zone_id === filters.zoneId);
        });
      }
      
      return data as Bin[];
    },
  });
};

export const useAddBin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bin: Omit<Bin, 'id' | 'created_at' | 'updated_at'> & { qr_code?: string }) => {
      const { data, error } = await supabase
        .from("bins")
        .insert([{ ...bin, qr_code: bin.qr_code || '' }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bins"] });
      toast.success("Bin created successfully with QR code");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create bin");
    },
  });
};

export const useUpdateBin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Bin> }) => {
      const { data, error } = await supabase
        .from("bins")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bins"] });
      toast.success("Bin updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update bin");
    },
  });
};

export const useDeleteBin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bins")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bins"] });
      toast.success("Bin deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete bin");
    },
  });
};
