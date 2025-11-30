import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const RealtimeIndicator = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const channel = supabase.channel('connection-status');
    
    channel
      .on('system', {}, (payload) => {
        if (payload.extension === 'postgres_changes') {
          setIsConnected(payload.status === 'ok');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-border/50">
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 text-primary animate-pulse" />
          <span className="text-xs font-mono text-primary">LIVE</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">OFFLINE</span>
        </>
      )}
    </div>
  );
};

export default RealtimeIndicator;