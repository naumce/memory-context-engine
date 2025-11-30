import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeZones = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('zones-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'zones'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['zones'] });
          queryClient.invalidateQueries({ queryKey: ['zones-performance'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
