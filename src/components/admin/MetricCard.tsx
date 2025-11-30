import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "primary" | "secondary" | "accent" | "muted";
}

const MetricCard = ({ title, value, unit, icon: Icon, trend, variant = "muted" }: MetricCardProps) => {
  const variantStyles = {
    primary: "border-primary/30 glow-primary",
    secondary: "border-secondary/30 glow-secondary",
    accent: "border-accent/50",
    muted: "border-border",
  };

  const iconVariants = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-foreground",
    muted: "text-muted-foreground",
  };

  return (
    <div className={cn("glass rounded-lg p-6 border-2 transition-all hover:scale-[1.02]", variantStyles[variant])}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-accent/50">
          <Icon className={cn("w-6 h-6", iconVariants[variant])} />
        </div>
        {trend && (
          <span className="text-xs font-mono text-primary font-semibold px-2 py-1 bg-primary/10 rounded">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-display font-bold">
          {typeof value === "number" && unit === "€" ? unit : ""}
          {value}
          {unit && unit !== "€" && <span className="text-lg ml-1 text-muted-foreground">{unit}</span>}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
