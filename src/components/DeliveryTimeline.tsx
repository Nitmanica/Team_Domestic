import { Check, Lock, Truck, User, Package, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { key: "created", label: "Order Created", icon: Package },
  { key: "locked", label: "Payment Locked", icon: Lock },
  { key: "assigned", label: "Driver Assigned", icon: User },
  { key: "transit", label: "In Transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
  { key: "completed", label: "Completed", icon: CircleCheck },
];

const statusOrder = ["created", "locked", "assigned", "transit", "delivered", "completed"];

export const DeliveryTimeline = ({ currentStatus }: { currentStatus: string }) => {
  const currentIdx = statusOrder.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, i) => {
        const isComplete = i <= currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isComplete ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={cn("text-[10px] text-center leading-tight", isComplete ? "text-foreground font-medium" : "text-muted-foreground")}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-1", i < currentIdx ? "bg-secondary" : "bg-muted")} />
            )}
          </div>
        );
      })}
    </div>
  );
};
