import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  zone_id: string;
  title: string;
  message: string;
  notification_type: string;
  severity: string;
  status: string;
  target_audience: string;
  send_method: string[] | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
}

export const useNotifications = (zoneId?: string) => {
  return useQuery({
    queryKey: ["notifications", zoneId],
    queryFn: async () => {
      let query = supabase
        .from("zone_notifications")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (zoneId) {
        query = query.eq("zone_id", zoneId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!zoneId,
  });
};

export const useAddNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at' | 'sent_at'>) => {
      const { data, error } = await supabase
        .from("zone_notifications")
        .insert([notification])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", variables.zone_id] });
      toast.success("Notification created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create notification");
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Notification> }) => {
      const { data, error } = await supabase
        .from("zone_notifications")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", data.zone_id] });
      toast.success("Notification updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update notification");
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, zoneId }: { id: string; zoneId: string }) => {
      const { error } = await supabase
        .from("zone_notifications")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { id, zoneId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", data.zoneId] });
      toast.success("Notification deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });
};
