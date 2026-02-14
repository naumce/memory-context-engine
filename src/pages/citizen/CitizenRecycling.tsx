import CitizenLayout from "@/components/citizen/CitizenLayout";
import { useCitizenAuth } from "@/hooks/useCitizenAuth";
import { useCitizenRecyclingStats } from "@/hooks/useCitizenRecycling";
import { useCitizenProfile } from "@/hooks/useCitizenProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Recycle, Leaf, Trophy, TrendingUp, Droplets, Package, Trash2 } from "lucide-react";
import { format } from "date-fns";

const WASTE_ICONS: Record<string, any> = {
  plastic: Package,
  paper: Leaf,
  glass: Droplets,
  organic: Recycle,
  metal: Trophy,
};

const CitizenRecycling = () => {
  const { user } = useCitizenAuth();
  const { data: stats } = useCitizenRecyclingStats(user?.id);
  const { data: profile } = useCitizenProfile(user?.id);

  // Gamification levels
  const level = Math.floor((profile?.total_points || 0) / 100) + 1;
  const pointsInLevel = (profile?.total_points || 0) % 100;
  const levelProgress = pointsInLevel;

  return (
    <CitizenLayout>
      <div className="space-y-6 py-4">
        <div>
          <h1 className="text-2xl font-display text-glow-primary flex items-center gap-2">
            <Recycle className="w-6 h-6" />
            My Recycling
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track your environmental impact</p>
        </div>

        {/* Level Card */}
        <Card className="glass border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground font-mono">ECO WARRIOR LEVEL</p>
                <p className="text-4xl font-display text-primary text-glow-primary">{level}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-mono">TOTAL POINTS</p>
                <p className="text-2xl font-display text-secondary">{profile?.total_points || 0}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Level {level}</span>
                <span>{pointsInLevel}/100 to Level {level + 1}</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass border-border/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-display">{stats?.totalWeight.toFixed(1) || "0"}</p>
              <p className="text-[10px] text-muted-foreground font-mono">KG TOTAL</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-display">{stats?.totalLogs || 0}</p>
              <p className="text-[10px] text-muted-foreground font-mono">ENTRIES</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/30">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-display text-primary">{profile?.recycling_streak || 0}</p>
              <p className="text-[10px] text-muted-foreground font-mono">STREAK</p>
            </CardContent>
          </Card>
        </div>

        {/* Waste Type Breakdown */}
        {stats && Object.keys(stats.byType).length > 0 && (
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                By Material
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.byType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, weight]) => {
                  const Icon = WASTE_ICONS[type] || Trash2;
                  const pct = stats.totalWeight > 0 ? (weight / stats.totalWeight) * 100 : 0;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2 capitalize">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          {type}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">{weight.toFixed(1)} kg</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {stats && stats.logs.length > 0 && (
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">{log.waste_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.logged_at), "MMM d")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.weight_kg && (
                      <span className="text-xs font-mono">{Number(log.weight_kg).toFixed(1)} kg</span>
                    )}
                    <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">
                      +{log.points_earned} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {(!stats || stats.logs.length === 0) && (
          <Card className="glass border-border/30">
            <CardContent className="p-8 text-center">
              <Recycle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No recycling activity logged yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Start recycling to earn points!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </CitizenLayout>
  );
};

export default CitizenRecycling;
