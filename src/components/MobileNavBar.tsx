import { Home, Search, Wallet, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", href: "/customer" },
  { icon: Search, label: "Track", href: "/customer/track" },
  { icon: Wallet, label: "Wallet", href: "/customer/wallet" },
  { icon: Clock, label: "History", href: "/customer/history" },
  { icon: User, label: "Profile", href: "/customer/profile" },
];

export const MobileNavBar = ({ active = "Home" }: { active?: string }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border/50 px-4 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.label === active;
          return (
            <button
              key={item.label}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all",
                isActive ? "text-secondary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_hsl(263_70%_58%/0.5)]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
