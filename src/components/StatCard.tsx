import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "purple" | "teal" | "gradient";
}

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  return (
    <div className={cn(
      "glass-card-elevated p-5 flex flex-col gap-3 group hover:scale-[1.02] transition-transform",
      variant === "gradient" && "gradient-primary text-primary-foreground border-0",
      variant === "purple" && "border-secondary/20 bg-secondary/5",
      variant === "teal" && "border-accent/20 bg-accent/5",
    )}>
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", variant === "gradient" ? "text-primary-foreground/70" : "text-muted-foreground")}>{title}</span>
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center",
          variant === "gradient" ? "bg-primary-foreground/10" : "bg-secondary/10"
        )}>
          <Icon className={cn("w-4 h-4", variant === "gradient" ? "text-primary-foreground" : "text-secondary")} />
        </div>
      </div>
      <div>
        <p className={cn("text-2xl font-bold font-display", variant === "gradient" ? "text-primary-foreground" : "text-foreground")}>{value}</p>
        {subtitle && <p className={cn("text-xs mt-1", variant === "gradient" ? "text-primary-foreground/60" : "text-muted-foreground")}>{subtitle}</p>}
        {trend && <span className="text-xs text-success font-medium">{trend}</span>}
      </div>
    </div>
  );
};
