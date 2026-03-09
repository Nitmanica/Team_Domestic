import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Truck, DollarSign, Star, MapPin, Check, X, Navigation, Upload, Camera } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { orders as ordersApi, delivery, type Order } from "@/lib/api";
import { toast } from "sonner";

const DriverDashboard = () => {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [accepted, setAccepted] = useState<Order | null>(null);
  const [showProof, setShowProof] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);

  useEffect(() => {
    ordersApi.available().then(setAvailableOrders).catch(() => {});
    ordersApi.myDriver().then(setMyOrders).catch(() => {});
  }, []);

  const handleAccept = async (order: Order) => {
    setLoading(true);
    try {
      await ordersApi.accept(order.order_id);
      setAccepted(order);
      setAvailableOrders((prev) => prev.filter((o) => o.order_id !== order.order_id));
      setMyOrders((prev) => [order, ...prev]);
      toast.success("Order accepted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to accept");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!accepted) return;
    setSubmittingProof(true);
    try {
      await delivery.proof({ order_id: accepted.order_id, gps_lat: 18.5204, gps_lng: 73.8567 });
      toast.success("Delivery proof submitted");
      setShowProof(false);
      setAccepted(null);
      ordersApi.myDriver().then(setMyOrders).catch(() => {});
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit proof");
    } finally {
      setSubmittingProof(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="gradient-primary px-6 pt-12 pb-16 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/60 text-sm">Driver Dashboard</p>
            <h1 className="text-xl font-display font-bold text-primary-foreground">{user?.full_name || user?.email || "Driver"}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <span className="text-primary-foreground font-bold">RK</span>
          </div>
        </div>

        {/* Map */}
        <div className="bg-primary-foreground/10 rounded-2xl h-36 flex items-center justify-center relative overflow-hidden">
          <Navigation className="w-6 h-6 text-primary-foreground/40" />
          <span className="ml-2 text-sm text-primary-foreground/40">Nearby pickup requests</span>
          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-4 h-4 bg-accent/60 rounded-full border-2 border-accent" style={{ top: "45%", left: "35%" }} />
          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.7 }} className="absolute w-4 h-4 bg-secondary/60 rounded-full border-2 border-secondary" style={{ top: "55%", left: "60%" }} />
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 -mt-8 relative z-10 grid grid-cols-2 gap-3">
        <StatCard title="Active Deliveries" value={1} icon={Truck} variant="purple" />
        <StatCard title="Today's Earnings" value="₹4,200" icon={DollarSign} variant="teal" />
        <StatCard title="Completed" value={12} icon={Package} subtitle="This week" />
        <StatCard title="Rating" value="4.9" icon={Star} trend="↑ 0.1" />
      </div>

      {/* Available Orders or Accepted */}
      <div className="px-6 mt-6">
        {!accepted ? (
          <>
            <h2 className="font-display font-semibold text-sm mb-3">Available Deliveries</h2>
            <div className="space-y-3">
              {availableOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No available deliveries right now.</p>
              ) : (
                availableOrders.map((order, i) => (
                  <motion.div key={order.order_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="glass-card-elevated p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-sm">#{order.order_id}</span>
                      <span className="text-lg font-bold text-secondary">{order.amount_display || "—"}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <span>{order.pickup_location || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        <span>{order.drop_location || "—"}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{order.cargo_category || "—"}</span>
                      <span>{order.weight_kg ? `${order.weight_kg} kg` : "—"}</span>
                      <span>{order.distance_km ? `${order.distance_km} km` : "—"}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleAccept(order)} disabled={loading} className="flex-1 gradient-primary border-0 text-primary-foreground h-9 text-xs gap-1">
                        <Check className="w-3 h-3" /> Accept
                      </Button>
                      <Button variant="outline" className="h-9 text-xs gap-1">
                        <X className="w-3 h-3" /> Reject
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        ) : !showProof ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-display font-semibold text-sm">Active Delivery {accepted?.order_id}</h2>
            <div className="glass-card-elevated p-4 space-y-4">
              <StatusBadge status="transit" />
              <div className="bg-muted/50 rounded-xl h-40 flex items-center justify-center">
                <Navigation className="w-6 h-6 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Navigation Mode</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance Remaining</span>
                <span className="font-semibold">42 km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ETA</span>
                <span className="font-semibold">1h 15min</span>
              </div>
              <Button onClick={() => setShowProof(true)} className="w-full gradient-accent border-0 text-accent-foreground h-10 text-sm gap-2">
                <Upload className="w-4 h-4" /> Upload Delivery Proof (photo step)
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-display font-semibold text-sm">Upload Delivery Proof</h2>
            <div className="glass-card-elevated p-5 space-y-4">
              <div className="border-2 border-dashed border-border rounded-2xl h-40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-secondary transition-colors">
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Take delivery photo</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>GPS: 18.5204° N, 73.8567° E</span>
              </div>
              <Button onClick={handleSubmitProof} disabled={submittingProof} className="w-full gradient-primary border-0 text-primary-foreground h-10 text-sm gap-2">
                <Upload className="w-4 h-4" /> {submittingProof ? "Submitting..." : "Submit Proof & Mark Delivered"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
