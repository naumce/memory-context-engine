import { AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/hooks/useAlerts";

const AlertPanel = () => {
  const { data: alerts, isLoading } = useAlerts();

  if (isLoading || !alerts || alerts.length === 0) {
    return null;
  }

  const topAlert = alerts[0]; // Show the most critical alert

  return (
    <div className="glass rounded-lg border-2 border-warning/50 p-4 mb-8 glow-secondary">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-warning/20 mt-1">
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-display text-sm text-warning">THE ORACLE PREDICTION</h3>
            {topAlert.probability && (
              <span className="px-2 py-1 bg-warning/20 text-warning text-xs font-mono rounded">
                {topAlert.probability}% PROBABILITY
              </span>
            )}
          </div>
          <p className="text-sm text-foreground mb-3">
            <strong>{topAlert.zone}</strong> {topAlert.message.replace(topAlert.zone || '', '')}.
            {topAlert.prediction && ` ${topAlert.prediction}`}
          </p>
          <div className="flex items-center gap-3">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-display">
              <TrendingUp className="w-4 h-4 mr-2" />
              {topAlert.action || "Take Action"}
            </Button>
            <Button size="sm" variant="outline" className="glass font-display">
              <Clock className="w-4 h-4 mr-2" />
              Simulate Scenario
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
