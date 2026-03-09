import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Shield, ExternalLink, CheckCircle, Coins, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockchainCard } from "@/components/BlockchainCard";
import { DeliveryTimeline } from "@/components/DeliveryTimeline";
import { useNavigate } from "react-router-dom";

const EscrowPayment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"review" | "locking" | "locked">("review");

  const handlePay = () => {
    setStep("locking");
    setTimeout(() => setStep("locked"), 2500);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-lg">Escrow Payment</h1>
      </div>

      <div className="px-6 space-y-4">
        <AnimatePresence mode="wait">
          {step === "review" && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Order Summary */}
              <div className="glass-card-elevated p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono font-semibold">#TR-4522</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-semibold">Mumbai → Pune</span>
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Price</span>
                    <span>₹2,200</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Express Fee</span>
                    <span>₹200</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gas Fee (est.)</span>
                    <span>₹15</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-secondary text-xl">₹2,415</span>
                  </div>
                </div>
              </div>

              {/* Escrow info */}
              <div className="glass-card p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Smart Contract Escrow</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment will be locked in a secure smart contract and automatically released to the driver upon delivery confirmation.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 font-mono">Network: Ethereum Sepolia</p>
                </div>
              </div>

              <Button onClick={handlePay} className="w-full gradient-primary border-0 text-primary-foreground h-12 text-sm font-semibold gap-2">
                <Lock className="w-4 h-4" /> Pay & Lock Payment
              </Button>
              <Button variant="outline" className="w-full h-10 text-sm gap-2">
                <ExternalLink className="w-4 h-4" /> View Smart Contract
              </Button>
            </motion.div>
          )}

          {step === "locking" && (
            <motion.div key="locking" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-16 gap-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center glow-purple"
              >
                <Lock className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <div className="text-center">
                <h2 className="font-display font-bold text-lg">Locking Payment...</h2>
                <p className="text-sm text-muted-foreground mt-2">Interacting with smart contract</p>
              </div>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-secondary"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === "locked" && (
            <motion.div key="locked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div className="flex flex-col items-center py-8 gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-success" />
                </motion.div>
                <h2 className="font-display font-bold text-lg">Payment Locked!</h2>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  ₹2,415 has been securely locked in the escrow smart contract
                </p>
              </div>

              <BlockchainCard
                txHash="0x7a3f...8d2e4b1c9f0a6e3d7b5c8f2a1e4d9c6b3f8a7e"
                network="Ethereum Sepolia"
                gasUsed="0.0023 ETH"
                status="Confirmed"
                timestamp="Just now"
              />

              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-3">Delivery Status</h3>
                <DeliveryTimeline currentStatus="locked" />
              </div>

              <Button onClick={() => navigate("/customer")} className="w-full gradient-primary border-0 text-primary-foreground h-12 text-sm font-semibold">
                Back to Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EscrowPayment;
