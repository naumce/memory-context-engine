import CitizenLayout from "@/components/citizen/CitizenLayout";
import { useCitizenAuth } from "@/hooks/useCitizenAuth";
import { useCitizenProfile } from "@/hooks/useCitizenProfile";
import { useCitizenSchedule, DAY_NAMES } from "@/hooks/useCitizenSchedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Truck, MapPin, Info } from "lucide-react";

const CitizenSchedule = () => {
  const { user } = useCitizenAuth();
  const { data: profile } = useCitizenProfile(user?.id);
  const { data: schedules, isLoading } = useCitizenSchedule(profile?.zone_id ?? undefined);

  const today = new Date().getDay();

  return (
    <CitizenLayout>
      <div className="space-y-6 py-4">
        <div>
          <h1 className="text-2xl font-display text-glow-secondary flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Collection Schedule
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {profile?.zones?.name ? `Schedule for ${profile.zones.name}` : "Set your zone in profile to see schedules"}
          </p>
        </div>

        {!profile?.zone_id && (
          <Card className="glass border-warning/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-warning flex-shrink-0" />
              <p className="text-sm text-warning">
                Set your zone in your profile to view your collection schedule.
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading && profile?.zone_id && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass border-border/30 animate-pulse">
                <CardContent className="p-4 h-20" />
              </Card>
            ))}
          </div>
        )}

        {schedules && schedules.length === 0 && (
          <Card className="glass border-border/30">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No collection schedules set for your zone yet.</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {schedules?.map((schedule) => {
            const isToday = schedule.day_of_week === today;
            return (
              <Card
                key={schedule.id}
                className={`glass transition-all ${isToday ? "border-primary/50 shadow-[0_0_15px_rgba(57,255,20,0.15)]" : "border-border/30"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm">
                        {DAY_NAMES[schedule.day_of_week]}
                      </span>
                      {isToday && (
                        <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">TODAY</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] capitalize">
                      {schedule.collection_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {schedule.time_slot && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {schedule.time_slot}
                      </span>
                    )}
                    {schedule.trucks && (
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" /> {(schedule.trucks as any).vehicle_id}
                      </span>
                    )}
                  </div>
                  {schedule.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">{schedule.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </CitizenLayout>
  );
};

export default CitizenSchedule;
