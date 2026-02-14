import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCitizenIssues = (userId?: string) => {
  return useQuery({
    queryKey: ["citizen-issues", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("citizen_issues")
        .select("*, zones(name)")
        .eq("citizen_user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (issue: {
      citizen_user_id: string;
      title: string;
      description: string;
      category: string;
      severity: string;
      address?: string;
      zone_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("citizen_issues")
        .insert([issue])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["citizen-issues", vars.citizen_user_id] });
      toast.success("Issue reported successfully");
    },
    onError: (err: any) => toast.error(err.message),
  });
};
