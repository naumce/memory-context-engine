import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCitizenProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["citizen-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("citizen_profiles")
        .select("*, zones(name, code)")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useUpdateCitizenProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Record<string, any> }) => {
      const { data, error } = await supabase
        .from("citizen_profiles")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["citizen-profile", data.user_id] });
      toast.success("Profile updated");
    },
    onError: (err: any) => toast.error(err.message),
  });
};
