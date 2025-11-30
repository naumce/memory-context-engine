import { AlertTriangle, ClipboardList, Target } from "lucide-react";
import { useZoneStats } from "@/hooks/useZones";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const driverChecklist = [
  "Vehicle inspection and safety check before leaving depot",
  "Confirm assigned route and Zone A streets sequence",
  "Scan each bin (QR) before tipping – log contamination if seen",
  "Note blocked streets, missing bins, or overloaded points",
  "End-of-shift: review anomalies with supervisor and sync photos",
];

const phases = [
  { label: "Preparation", status: "done" },
  { label: "Week 1", status: "active" },
  { label: "Week 2", status: "upcoming" },
  { label: "Week 3", status: "upcoming" },
];

const PilotZonePanel = () => {
  const { data: zones, isLoading, error } = useQuery({
    queryKey: ["pilot-zone"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("code", "ZONE-A")
        .single();
      if (error) {
        console.error("Error fetching Zone A:", error);
        throw error;
      }
      return data;
    },
  });

  const { data: zoneStats } = useZoneStats(zones?.id);

  if (isLoading) {
    return <section className="mb-10">
      <div className="glass rounded-lg p-6">Loading pilot zone data...</div>
    </section>;
  }

  if (error) {
    return <section className="mb-10">
      <div className="glass rounded-lg p-6 text-destructive">Error loading pilot zone</div>
    </section>;
  }

  const kpis = [
    {
      label: "Participation Rate",
      value: zoneStats ? `${zoneStats.participationRate}%` : "...",
      detail: "Households presenting bins on scheduled days",
    },
    {
      label: "Active Households",
      value: zoneStats ? `${zoneStats.activeHouseholds}/${zoneStats.households}` : "...",
      detail: "Currently enrolled in the program",
    },
    {
      label: "Zone Health",
      value: zoneStats && zoneStats.participationRate > 85 ? "✓ Target" : "⚠ Monitor",
      detail: "Overall zone operational status",
    },
    {
      label: "Collections This Week",
      value: "12",
      detail: "Scheduled pickups completed",
    },
  ];

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* KPIs */}
        <div className="glass rounded-lg border-2 border-primary/40 p-6 xl:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/20">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm">PILOT ZONE A – MISSION CARD</h3>
              <p className="text-xs text-muted-foreground font-mono">What success looks like</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="glass rounded-lg border border-border/70 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {kpi.label}
                </p>
                <p className="text-2xl font-display text-primary mb-1">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="font-mono">If any KPI drifts for 3 days, escalate to Chairman&apos;s War Room.</span>
          </div>
        </div>

        {/* Driver Playbook */}
        <div className="glass rounded-lg border-2 border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-secondary/20">
              <ClipboardList className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-display text-sm">ZONE A – DRIVER PLAYBOOK</h3>
              <p className="text-xs text-muted-foreground font-mono">Today&apos;s field script</p>
            </div>
          </div>

          <ol className="space-y-3 text-sm">
            {driverChecklist.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 border border-primary/40 text-primary font-mono text-xs flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <p className="text-foreground/90">{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6">
            <p className="text-xs text-muted-foreground font-mono mb-2">Pilot Sprint Timeline</p>
            <div className="flex flex-wrap gap-2">
              {phases.map((phase) => (
                <span
                  key={phase.label}
                  className={[
                    "px-3 py-1 rounded-full text-xs font-mono border",
                    phase.status === "done" && "bg-primary/15 border-primary text-primary",
                    phase.status === "active" && "bg-secondary/15 border-secondary text-secondary",
                    phase.status === "upcoming" && "bg-muted border-border text-muted-foreground",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {phase.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PilotZonePanel;
