import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Truck, Wallet, Star, Bell, MessageCircle, MapPin, Plus, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { orders as ordersApi, delivery, escrow, type Order } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { MobileNavBar } from "@/components/MobileNavBar";
import { DeliveryTimeline } from "@/components/DeliveryTimeline";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentDeliveries, setRecentDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.myCustomer().then((list) => {
      setRecentDeliveries(list.slice(0, 10));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const mapStatus = (s: string) => (s === "in_transit" ? "transit" : s === "released" ? "completed" : s) as "transit" | "completed" | "locked" | "delivered" | "disputed" | "created";
  const [releasing, setReleasing] = useState<string | null>(null);
  const handleConfirmAndRelease = async (order: Order) => {
    if (order.status !== "delivered") return;
    setReleasing(order.order_id);
    try {
      await delivery.confirm(order.order_id);
      await escrow.release(order.order_id);
      ordersApi.myCustomer().then((list) => setRecentDeliveries(list.slice(0, 10)));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to release");
    } finally {
      setReleasing(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-6 pt-12 pb-20 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/60 text-sm">Welcome back</p>
            <h1 className="text-xl font-display font-bold text-primary-foreground">{user?.full_name || user?.email || "Customer"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary-foreground" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-primary-foreground/10 rounded-2xl h-40 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, hsl(263 70% 58% / 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, hsl(168 76% 40% / 0.3) 0%, transparent 50%)"
          }} />
          <div className="flex items-center gap-2 text-primary-foreground/50">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">Live delivery map</span>
          </div>
          {/* Animated dots representing vehicles */}
          <motion.div animate={{ x: [0, 60, 120], y: [0, -10, 5] }} transition={{ duration: 4, repeat: Infinity }} className="absolute w-3 h-3 bg-accent rounded-full shadow-lg" style={{ top: "40%", left: "20%" }} />
          <motion.div animate={{ x: [0, -30, -80], y: [5, -5, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute w-3 h-3 bg-secondary rounded-full shadow-lg" style={{ top: "60%", left: "60%" }} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-10 relative z-10">
        <div className="glass-card-elevated p-4 flex items-center justify-around">
          <button onClick={() => navigate("/customer/book")} className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-xs font-medium">Book</span>
          </button>
          <button className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs font-medium">Track</span>
          </button>
          <button onClick={() => navigate("/customer/wallet")} className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-warning" />
            </div>
            <span className="text-xs font-medium">Wallet</span>
          </button>
          <button className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <span className="text-xs font-medium">History</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-3">
        <StatCard title="Active Deliveries" value={recentDeliveries.filter((o) => ["locked", "in_transit", "delivered"].includes(o.status)).length} icon={Truck} variant="purple" />
        <StatCard title="Wallet Balance" value="₹12,400" icon={Wallet} variant="teal" />
        <StatCard title="Total Deliveries" value={recentDeliveries.length} icon={Package} subtitle="Total" />
        <StatCard title="Reputation" value="4.8" icon={Star} trend="↑ 0.2" />
      </div>

      {/* Active Delivery Timeline - show first active if any */}
      {recentDeliveries.some((o) => ["locked", "in_transit"].includes(o.status)) && (
        <div className="px-6 mt-6">
          <h2 className="font-display font-semibold text-sm mb-3">Active Delivery</h2>
          <div className="glass-card p-4">
            <DeliveryTimeline currentStatus={recentDeliveries.find((o) => ["locked", "in_transit"].includes(o.status))?.status === "in_transit" ? "transit" : "locked"} />
          </div>
        </div>
      )}

      {/* Recent Deliveries */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-sm">Recent Deliveries</h2>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-3">
            {recentDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deliveries yet. Book your first one!</p>
            ) : (
              recentDeliveries.map((d, i) => (
                <motion.div
                  key={d.order_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">#{d.order_id}</p>
                      <StatusBadge status={mapStatus(d.status)} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.pickup_location || "—"} → {d.drop_location || "—"} • {d.driver_name || "—"}</p>
                    <p className="text-xs font-semibold text-foreground mt-1">{d.amount_display || "—"}</p>
                    {d.status === "delivered" && (
                      <Button size="sm" className="mt-2 gradient-primary border-0 text-primary-foreground h-8 text-xs" onClick={() => handleConfirmAndRelease(d)} disabled={!!releasing}>
                        {releasing === d.order_id ? "Releasing..." : "Confirm & Release payment"}
                      </Button>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      <MobileNavBar active="Home" />
    </div>
  );
};

export default CustomerDashboard;
