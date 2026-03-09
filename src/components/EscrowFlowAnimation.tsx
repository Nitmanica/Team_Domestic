import { motion } from "framer-motion";
import { Lock, Unlock, Truck, Shield, ArrowDown, CheckCircle, Coins } from "lucide-react";

const steps = [
  { icon: Coins, label: "Customer Payment", sublabel: "₹1,000 sent", color: "text-secondary" },
  { icon: Lock, label: "Escrow Smart Contract", sublabel: "Payment locked securely", color: "text-warning" },
  { icon: Truck, label: "Delivery Confirmed", sublabel: "Proof verified on-chain", color: "text-info" },
  { icon: Unlock, label: "Payment Released", sublabel: "Funds sent to supplier", color: "text-success" },
];

export const EscrowFlowAnimation = () => {
  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl md:text-2xl font-bold font-display text-center mb-6"
      >
        Trustless Escrow Payment
        <span className="block gradient-text text-lg md:text-xl mt-1">Powered by Blockchain</span>
      </motion.h2>

      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.6, duration: 0.5, type: "spring" }}
          className="flex flex-col items-center"
        >
          <div className="glass-card-elevated p-5 flex items-center gap-4 min-w-[280px] hover:scale-105 transition-transform">
            <div className={`w-12 h-12 rounded-2xl bg-muted flex items-center justify-center ${step.color}`}>
              <step.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.sublabel}</p>
            </div>
            {i === steps.length - 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (steps.length) * 0.6, type: "spring" }}
              >
                <CheckCircle className="w-5 h-5 text-success" />
              </motion.div>
            )}
          </div>
          {i < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.6 + 0.4, duration: 0.3 }}
              className="flex flex-col items-center py-1"
            >
              <div className="w-0.5 h-6 bg-secondary/30" />
              <ArrowDown className="w-4 h-4 text-secondary/50" />
            </motion.div>
          )}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: steps.length * 0.6 + 0.3 }}
        className="mt-6 flex items-center gap-2"
      >
        <Shield className="w-4 h-4 text-accent" />
        <span className="text-xs text-muted-foreground">Secured by Ethereum Smart Contracts</span>
      </motion.div>
    </div>
  );
};
