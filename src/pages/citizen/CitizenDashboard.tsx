import CitizenLayout from "@/components/citizen/CitizenLayout";
import { useCitizenAuth } from "@/hooks/useCitizenAuth";
import { useCitizenProfile } from "@/hooks/useCitizenProfile";
import { useCitizenRecyclingStats } from "@/hooks/useCitizenRecycling";
import { useCitizenIssues } from "@/hooks/useCitizenIssues";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recycle, Trophy, Flame, AlertTriangle, TrendingUp, Leaf } from "lucide-react";

const CitizenDashboard = () => {
  const { user } = useCitizenAuth();
  const { data: profile } = useCitizenProfile(user?.id);
  const { data: stats } = useCitizenRecyclingStats(user?.id);
  const { data: issues } = useCitizenIssues(user?.id);

  const openIssues = issues?.filter((i) => i.status === "open").length || 0;

  return (
    <CitizenLayout>
      <div className="space-y-6 py-4">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-display text-glow-primary">
            Welcome, {profile?.full_name || "Citizen"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {profile?.zones?.name ? `Zone: ${profile.zones.name}` : "Your environmental impact dashboard"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass border-primary/20">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Trophy className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-display text-primary">{profile?.total_points || 0}</p>
              <p className="text-xs text-muted-foreground font-mono">ECO POINTS</p>
            </CardContent>
          </Card>

          <Card className="glass border-secondary/20">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Flame className="w-8 h-8 text-secondary mb-2" />
              <p className="text-2xl font-display text-secondary">{profile?.recycling_streak || 0}</p>
              <p className="text-xs text-muted-foreground font-mono">DAY STREAK</p>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Recycle className="w-8 h-8 text-foreground mb-2" />
              <p className="text-2xl font-display">{stats?.totalWeight.toFixed(1) || "0"}</p>
              <p className="text-xs text-muted-foreground font-mono">KG RECYCLED</p>
            </CardContent>
          </Card>

          <Card className="glass border-warning/20">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <AlertTriangle className="w-8 h-8 text-warning mb-2" />
              <p className="text-2xl font-display text-warning">{openIssues}</p>
              <p className="text-xs text-muted-foreground font-mono">OPEN ISSUES</p>
            </CardContent>
          </Card>
        </div>

        {/* Recycling Breakdown */}
        {stats && Object.keys(stats.byType).length > 0 && (
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                Recycling Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(stats.byType).map(([type, weight]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{type}</span>
                  <Badge variant="outline" className="font-mono">{weight.toFixed(1)} kg</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Issues */}
        {issues && issues.length > 0 && (
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {issues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="flex items-center justify-between py-1">
                  <span className="text-sm truncate flex-1">{issue.title}</span>
                  <Badge
                    variant={issue.status === "open" ? "destructive" : issue.status === "resolved" ? "default" : "secondary"}
                    className="text-[10px] ml-2"
                  >
                    {issue.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </CitizenLayout>
  );
};

export default CitizenDashboard;
