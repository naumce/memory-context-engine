import { useEffect, useState } from "react";
import { Coins, Trash2, TrendingUp, Users, CheckCircle } from "lucide-react";

interface FeedEvent {
  id: string;
  type: "collection" | "coin" | "milestone" | "citizen";
  message: string;
  time: string;
  icon: any;
}

const mockEvents: FeedEvent[] = [
  { id: "1", type: "coin", message: "Elena K. earned 20 STG for recycling 2kg plastic", time: "2s ago", icon: Coins },
  { id: "2", type: "collection", message: "Truck 01 completed Zone A collection route", time: "12s ago", icon: CheckCircle },
  { id: "3", type: "citizen", message: "New citizen registered: Nikola P.", time: "34s ago", icon: Users },
  { id: "4", type: "coin", message: "Ivan M. earned 15 STG for glass recycling", time: "1m ago", icon: Coins },
  { id: "5", type: "milestone", message: "Zone B reached 85% participation rate!", time: "2m ago", icon: TrendingUp },
  { id: "6", type: "collection", message: "Truck 02 arrived at depot for unload", time: "3m ago", icon: Trash2 },
  { id: "7", type: "coin", message: "Marija S. earned 25 STG for paper recycling", time: "4m ago", icon: Coins },
  { id: "8", type: "citizen", message: "Stefan K. completed first mission!", time: "5m ago", icon: Users },
];

const LiveFeed = () => {
  const [events, setEvents] = useState(mockEvents);
  const [newEventCount, setNewEventCount] = useState(0);

  useEffect(() => {
    // Simulate new events every 5 seconds
    const interval = setInterval(() => {
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      const newEvent = {
        ...randomEvent,
        id: Date.now().toString(),
        time: "just now",
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      setNewEventCount(prev => prev + 1);
      setTimeout(() => setNewEventCount(0), 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getEventColor = (type: string) => {
    switch (type) {
      case "coin": return "text-primary";
      case "collection": return "text-secondary";
      case "milestone": return "text-warning";
      case "citizen": return "text-foreground";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="glass rounded-lg border-2 border-border p-4 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-sm">LIVE FEED</h3>
            <p className="text-xs text-muted-foreground font-mono">Real-time Activity</p>
          </div>
        </div>
        {newEventCount > 0 && (
          <div className="px-2 py-1 rounded-full bg-primary/20 border border-primary">
            <span className="text-xs font-mono text-primary">+{newEventCount}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {events.map((event, index) => {
          const Icon = event.icon;
          return (
            <div
              key={event.id}
              className="glass rounded-lg p-3 border border-border/50 hover:border-primary/30 transition-all animate-in fade-in slide-in-from-top-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex gap-3">
                <div className={cn("mt-0.5", getEventColor(event.type))}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">{event.message}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{event.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default LiveFeed;
