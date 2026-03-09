import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Package, Truck, Zap, Clock, Route, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const vehicleTypes = [
  { label: "Mini Truck", icon: "🛻", capacity: "500 kg" },
  { label: "Standard", icon: "🚛", capacity: "2 ton" },
  { label: "Heavy", icon: "🚚", capacity: "5 ton" },
];

const BookDelivery = () => {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState(1);
  const [calculated, setCalculated] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate("/customer")} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-lg">Book Delivery</h1>
      </div>

      {/* Map preview */}
      <div className="mx-6 h-36 rounded-2xl bg-muted relative overflow-hidden mb-6">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 25% 50%, hsl(263 70% 58% / 0.4) 0%, transparent 40%), radial-gradient(circle at 75% 50%, hsl(168 76% 40% / 0.4) 0%, transparent 40%)"
        }} />
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          <Route className="w-5 h-5 mr-2" /> Route Preview
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Pickup & Drop */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-success" />
            <Input placeholder="Pickup location" className="border-0 bg-muted/50 h-10 text-sm" defaultValue="Andheri East, Mumbai" />
          </div>
          <div className="ml-1.5 w-0.5 h-4 bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <Input placeholder="Drop location" className="border-0 bg-muted/50 h-10 text-sm" defaultValue="Hinjewadi, Pune" />
          </div>
        </div>

        {/* Cargo */}
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-secondary" /> Cargo Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Cargo category" className="bg-muted/50 border-0 h-10 text-sm" defaultValue="Electronics" />
            <Input placeholder="Weight (kg)" className="bg-muted/50 border-0 h-10 text-sm" defaultValue="350" />
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Truck className="w-4 h-4 text-secondary" /> Vehicle Type
          </h3>
          <div className="flex gap-3">
            {vehicleTypes.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setSelectedVehicle(i)}
                className={`flex-1 glass-card p-3 text-center transition-all ${i === selectedVehicle ? "ring-2 ring-secondary glow-purple" : ""}`}
              >
                <span className="text-2xl">{v.icon}</span>
                <p className="text-xs font-semibold mt-1">{v.label}</p>
                <p className="text-[10px] text-muted-foreground">{v.capacity}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">Express Delivery</span>
          </div>
          <div className="w-10 h-6 bg-secondary rounded-full relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-secondary-foreground rounded-full" />
          </div>
        </div>

        {/* Calculated estimate */}
        {calculated && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-elevated p-4 space-y-2 border-secondary/20">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-semibold">148 km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Time</span>
              <span className="font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> 3h 20min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Price</span>
              <span className="font-semibold">₹2,200</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Express Fee</span>
              <span className="font-semibold">₹200</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-secondary text-lg">₹2,400</span>
            </div>
          </motion.div>
        )}

        {!calculated ? (
          <Button onClick={() => setCalculated(true)} className="w-full gradient-primary border-0 text-primary-foreground h-12 text-sm font-semibold gap-2">
            <Calculator className="w-4 h-4" /> Calculate Price
          </Button>
        ) : (
          <Button onClick={() => navigate("/customer/escrow")} className="w-full gradient-accent border-0 text-accent-foreground h-12 text-sm font-semibold gap-2">
            Confirm Booking & Pay
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookDelivery;
