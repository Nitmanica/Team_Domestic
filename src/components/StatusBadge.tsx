import { cn } from "@/lib/utils";

type DeliveryStatus = "created" | "locked" | "assigned" | "transit" | "delivered" | "completed" | "disputed";

const statusConfig: Record<DeliveryStatus, { label: string; className: string }> = {
  created: { label: "Created", className: "status-created" },
  locked: { label: "Payment Locked", className: "status-locked" },
  assigned: { label: "Driver Assigned", className: "status-assigned" },
  transit: { label: "In Transit", className: "status-transit" },
  delivered: { label: "Delivered", className: "status-delivered" },
  completed: { label: "Completed", className: "status-completed" },
  disputed: { label: "Disputed", className: "status-disputed" },
};

export const StatusBadge = ({ status }: { status: DeliveryStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold", config.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
      {config.label}
    </span>
  );
};
