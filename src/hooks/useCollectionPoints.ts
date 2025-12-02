import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CollectionPoint {
  id: string;
  zone_id: string;
  name: string;
  location: any;
  point_type: string;
  capacity: number;
  current_bins: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useCollectionPoints = (zoneId?: string) => {
  return useQuery({
    queryKey: ["collection-points", zoneId],
    queryFn: async () => {
      let query = supabase
        .from("collection_points")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (zoneId) {
        query = query.eq("zone_id", zoneId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CollectionPoint[];
    },
    enabled: !!zoneId,
  });
};

export const useAddCollectionPoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (point: Omit<CollectionPoint, 'id' | 'created_at' | 'updated_at' | 'current_bins'>) => {
      const { data, error } = await supabase
        .from("collection_points")
        .insert([point])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collection-points", variables.zone_id] });
      toast.success("Trash island created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create trash island");
    },
  });
};

export const useUpdateCollectionPoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CollectionPoint> }) => {
      const { data, error } = await supabase
        .from("collection_points")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["collection-points", data.zone_id] });
      toast.success("Trash island updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update trash island");
    },
  });
};

export const useDeleteCollectionPoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, zoneId }: { id: string; zoneId: string }) => {
      const { error } = await supabase
        .from("collection_points")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { id, zoneId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["collection-points", data.zoneId] });
      toast.success("Trash island deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete trash island");
    },
  });
};
