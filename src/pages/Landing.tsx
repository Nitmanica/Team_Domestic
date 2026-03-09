import { motion } from "framer-motion";
import { ArrowRight, Shield, Truck, Lock, Zap, Globe, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EscrowFlowAnimation } from "@/components/EscrowFlowAnimation";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Lock, title: "Smart Contract Escrow", desc: "Payments locked until delivery is confirmed" },
  { icon: Truck, title: "Real-Time Tracking", desc: "Live GPS tracking of all deliveries" },
  { icon: Shield, title: "Fraud Prevention", desc: "AI-powered anomaly detection" },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Enterprise-grade monitoring tools" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-[0.03]" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">TrustRoute</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
            <Button size="sm" className="gradient-primary border-0 text-primary-foreground hover:opacity-90" onClick={() => navigate("/admin")}>
              Admin Dashboard
            </Button>
          </div>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-16 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
              <Zap className="w-3 h-3" />
              Blockchain-Powered Logistics
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Secure Deliveries with{" "}
              <span className="gradient-text">Blockchain Escrow</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Smart contract escrow payments that automatically lock and release funds when delivery is confirmed. No disputes. No fraud. Just trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gradient-primary border-0 text-primary-foreground hover:opacity-90 gap-2" onClick={() => navigate("/customer")}>
                Customer App <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate("/driver")}>
                <Globe className="w-4 h-4" /> Driver App
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card-elevated p-5 hover:scale-[1.03] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-display font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Animation */}
      <section id="demo" className="max-w-3xl mx-auto px-6 py-16">
        <EscrowFlowAnimation />
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          Built for Hackathon Demo • TrustRoute © 2026 • Powered by Ethereum Smart Contracts
        </p>
      </footer>
    </div>
  );
};

export default Landing;
