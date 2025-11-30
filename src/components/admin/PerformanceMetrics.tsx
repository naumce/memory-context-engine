import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const collectionData = [
  { day: 'Mon', tons: 38, rate: 82 },
  { day: 'Tue', tons: 42, rate: 85 },
  { day: 'Wed', tons: 35, rate: 79 },
  { day: 'Thu', tons: 45, rate: 88 },
  { day: 'Fri', tons: 52, rate: 91 },
  { day: 'Sat', tons: 48, rate: 87 },
  { day: 'Sun', tons: 31, rate: 75 },
];

const participationData = [
  { week: 'W1', zoneA: 85, zoneB: 72, zoneC: 65, zoneD: 54 },
  { week: 'W2', zoneA: 87, zoneB: 74, zoneC: 68, zoneD: 57 },
  { week: 'W3', zoneA: 89, zoneB: 76, zoneC: 70, zoneD: 60 },
  { week: 'W4', zoneA: 91, zoneB: 78, zoneC: 72, zoneD: 62 },
];

const PerformanceMetrics = () => {
  return (
    <div className="glass rounded-lg border-2 border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-secondary/20">
          <Activity className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-display text-sm">PERFORMANCE ANALYTICS</h3>
          <p className="text-xs text-muted-foreground font-mono">Trend Analysis & KPIs</p>
        </div>
      </div>

      <Tabs defaultValue="collection" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass">
          <TabsTrigger value="collection" className="font-display text-xs">
            Collection Volume
          </TabsTrigger>
          <TabsTrigger value="participation" className="font-display text-xs">
            Zone Participation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="mt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collectionData}>
                <defs>
                  <linearGradient id="colorTons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12, fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tons" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#colorTons)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-mono">+12% vs last week</span>
          </div>
        </TabsContent>

        <TabsContent value="participation" className="mt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="week" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12, fontFamily: 'JetBrains Mono' }}
                  domain={[50, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="zoneA" stroke="hsl(var(--primary))" strokeWidth={2} name="Zone A" />
                <Line type="monotone" dataKey="zoneB" stroke="hsl(var(--secondary))" strokeWidth={2} name="Zone B" />
                <Line type="monotone" dataKey="zoneC" stroke="hsl(var(--warning))" strokeWidth={2} name="Zone C" />
                <Line type="monotone" dataKey="zoneD" stroke="hsl(var(--destructive))" strokeWidth={2} name="Zone D" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {['A', 'B', 'C', 'D'].map((zone, idx) => (
              <div key={zone} className="glass rounded px-3 py-2">
                <p className="text-xs text-muted-foreground">Zone {zone}</p>
                <p className="text-sm font-mono font-semibold">
                  {participationData[participationData.length - 1][`zone${zone}` as keyof typeof participationData[0]]}%
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMetrics;
