import { motion } from "framer-motion";
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownRight, Plus, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const transactions = [
  { type: "lock", desc: "Escrow Lock — #TR-4521", amount: "-₹2,400", time: "Today, 2:30 PM" },
  { type: "release", desc: "Payment Released — #TR-4520", amount: "+₹3,100", time: "Yesterday" },
  { type: "fund", desc: "Wallet Top-up", amount: "+₹10,000", time: "Mar 6" },
  { type: "lock", desc: "Escrow Lock — #TR-4519", amount: "-₹4,200", time: "Mar 5" },
  { type: "release", desc: "Refund — #TR-4516", amount: "+₹1,500", time: "Mar 4" },
];

const CustomerWallet = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate("/customer")} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-lg">Wallet</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gradient-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <p className="text-primary-foreground/60 text-sm flex items-center gap-1"><Wallet className="w-3 h-3" /> Available Balance</p>
            <h2 className="text-3xl font-display font-bold mt-2">₹12,400</h2>
            <div className="flex items-center gap-4 mt-4 text-xs text-primary-foreground/60">
              <div>
                <p>Escrow Locked</p>
                <p className="text-primary-foreground font-semibold text-sm flex items-center gap-1"><Lock className="w-3 h-3" /> ₹6,600</p>
              </div>
              <div>
                <p>Pending</p>
                <p className="text-primary-foreground font-semibold text-sm">₹0</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1 gradient-accent border-0 text-accent-foreground h-11 text-sm gap-2">
            <Plus className="w-4 h-4" /> Add Funds
          </Button>
          <Button variant="outline" className="flex-1 h-11 text-sm gap-2">
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </Button>
          <Button variant="outline" className="h-11 text-sm gap-2">
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Transactions */}
        <div>
          <h3 className="font-display font-semibold text-sm mb-3">Transaction History</h3>
          <div className="space-y-2">
            {transactions.map((tx, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === "lock" ? "bg-warning/10" : tx.type === "fund" ? "bg-accent/10" : "bg-success/10"}`}>
                  {tx.type === "lock" ? <Lock className="w-4 h-4 text-warning" /> : tx.type === "fund" ? <ArrowDownRight className="w-4 h-4 text-accent" /> : <ArrowUpRight className="w-4 h-4 text-success" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{tx.desc}</p>
                  <p className="text-xs text-muted-foreground">{tx.time}</p>
                </div>
                <span className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-success" : "text-foreground"}`}>{tx.amount}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerWallet;
