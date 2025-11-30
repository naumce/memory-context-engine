import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeCollections = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('collections-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collections'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recent-collections'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
