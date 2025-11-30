import { Activity, CheckCircle2, Clock } from "lucide-react";
import { useRecentCollections } from "@/hooks/useRecentCollections";
import { formatDistanceToNow } from "date-fns";

const LiveFeed = () => {
  const { data: collections, isLoading } = useRecentCollections();

  return (
    <div className="glass rounded-lg border-2 border-border p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/20">
          <Activity className="w-5 h-5 text-accent animate-pulse" />
        </div>
        <div>
          <h3 className="font-display text-sm">LIVE ACTIVITY FEED</h3>
          <p className="text-xs text-muted-foreground font-mono">Real-time updates</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        ) : collections && collections.length > 0 ? (
          collections.map((collection) => (
            <div
              key={collection.id}
              className="glass rounded-lg p-4 border border-border/50 hover:border-primary/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-primary/15 border border-primary/40">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold font-mono">
                      {collection.trucks.vehicle_id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                      {collection.bins.bin_type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Driver: {collection.drivers.full_name}
                  </p>
                  {collection.weight_kg && (
                    <p className="text-xs text-muted-foreground">
                      Weight: {collection.weight_kg} kg
                    </p>
                  )}
                  {collection.contamination_level && collection.contamination_level !== 'clean' && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30 mt-1">
                      Contamination: {collection.contamination_level}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">
                    {formatDistanceToNow(new Date(collection.collected_at || collection.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent collections
          </p>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;
