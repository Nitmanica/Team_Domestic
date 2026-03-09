import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Truck, DollarSign, AlertTriangle, CheckCircle, Clock, Shield, ExternalLink, BarChart3, Users, Search, Filter } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { BlockchainCard } from "@/components/BlockchainCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { orders as ordersApi, disputes as disputesApi, type Order, type Dispute } from "@/lib/api";

const mapStatus = (s: string) => (s === "in_transit" ? "transit" : s === "released" ? "completed" : s) as "transit" | "completed" | "locked" | "delivered" | "disputed" | "created";

const fraudAlerts = [
  { severity: "high", message: "Suspicious route deviation detected", time: "12 min ago" },
  { severity: "medium", message: "Repeated disputes from driver", time: "2h ago" },
  { severity: "low", message: "Potential GPS spoofing", time: "5h ago" },
];

const drivers = [
  { name: "Raj Kumar", rating: 4.9, completed: 234, late: 3, fraud: 0.1 },
  { name: "Amit Singh", rating: 4.7, completed: 189, late: 8, fraud: 0.3 },
  { name: "Priya Menon", rating: 3.2, completed: 67, late: 15, fraud: 2.1 },
  { name: "Suresh Patel", rating: 4.8, completed: 312, late: 5, fraud: 0.0 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [disputesList, setDisputesList] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ordersApi.all(), disputesApi.list()])
      .then(([orders, disputes]) => {
        setTransactions(orders);
        setDisputesList(disputes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar-like header for web */}
      <div className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">TrustRoute</span>
            <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>← Back to Home</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Overview Stats */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4">Overview Dashboard</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Total Deliveries" value="1,247" icon={Package} variant="gradient" />
            <StatCard title="Active" value={23} icon={Truck} variant="purple" />
            <StatCard title="Completed" value="1,198" icon={CheckCircle} trend="↑ 12%" />
            <StatCard title="Disputes" value={8} icon={AlertTriangle} />
            <StatCard title="Payments Released" value="₹34.2L" icon={DollarSign} variant="teal" />
          </div>
        </div>

        {/* Charts placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card-elevated p-5">
            <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-secondary" /> Delivery Activity (7 days)
            </h3>
            <div className="h-40 flex items-end gap-2 px-4">
              {[65, 40, 80, 55, 90, 70, 85].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex-1 rounded-t-lg gradient-accent opacity-80"
                />
              ))}
            </div>
            <div className="flex justify-between px-4 mt-2 text-[10px] text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>

          <div className="glass-card-elevated p-5">
            <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-accent" /> Payment Trends
            </h3>
            <div className="h-40 flex items-end gap-2 px-4">
              {[45, 60, 35, 75, 50, 85, 70].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                  className="flex-1 rounded-t-lg bg-secondary/60"
                />
              ))}
            </div>
            <div className="flex justify-between px-4 mt-2 text-[10px] text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </div>

        {/* Transaction Monitor */}
        <div className="glass-card-elevated p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" /> Transaction Monitor
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search orders..." className="pl-9 h-8 text-xs w-48 bg-muted/50 border-0" />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <Filter className="w-3 h-3" /> Filter
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/50">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Driver</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : transactions).map((tx, i) => (
                  <motion.tr
                    key={tx.order_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 font-mono font-semibold">#{tx.order_id}</td>
                    <td className="py-3">{tx.customer_name || "—"}</td>
                    <td className="py-3">{tx.driver_name || "—"}</td>
                    <td className="py-3 font-semibold">{tx.amount_display || "—"}</td>
                    <td className="py-3"><StatusBadge status={mapStatus(tx.status)} /></td>
                    <td className="py-3 font-mono text-xs text-muted-foreground flex items-center gap-1">{tx.escrow_tx_lock ? `${tx.escrow_tx_lock.slice(0, 10)}...` : "—"} <ExternalLink className="w-3 h-3" /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two columns: Fraud + Drivers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* AI Fraud Alerts */}
          <div className="glass-card-elevated p-5">
            <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-destructive" /> AI Fraud Detection Alerts
            </h3>
            <div className="space-y-3">
              {fraudAlerts.map((alert, i) => (
                <div key={i} className={`p-3 rounded-xl border ${alert.severity === "high" ? "border-destructive/20 bg-destructive/5" : alert.severity === "medium" ? "border-warning/20 bg-warning/5" : "border-muted bg-muted/30"}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${alert.severity === "high" ? "text-destructive" : alert.severity === "medium" ? "text-warning" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-xs font-medium">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Driver Reputation */}
          <div className="glass-card-elevated p-5">
            <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" /> Driver Reputation
            </h3>
            <div className="space-y-2">
              {drivers.map((d, i) => (
                <div key={i} className="flex items-center gap-4 p-2 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {d.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{d.name}</p>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>⭐ {d.rating}</span>
                      <span>{d.completed} deliveries</span>
                      <span>{d.late} late</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${d.fraud > 1 ? "text-destructive" : d.fraud > 0 ? "text-warning" : "text-success"}`}>
                    Fraud: {d.fraud}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blockchain Explorer */}
        <div>
          <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-accent" /> Blockchain Explorer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BlockchainCard txHash="0x7a3f...8d2e4b1c9f0a6e3d7b5c8f2a1e4d9c6b3f8a7e" network="Ethereum Sepolia" gasUsed="0.0023 ETH" status="Confirmed" timestamp="2 min ago" />
            <BlockchainCard txHash="0x9b4c...1f7a3e8d2b5c6f0a9e4d7b8c1f3a6e2d5b9c4f" network="Ethereum Sepolia" gasUsed="0.0019 ETH" status="Confirmed" timestamp="15 min ago" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
