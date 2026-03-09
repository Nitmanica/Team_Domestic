import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"customer" | "driver">("customer");
  const [regName, setRegName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Email and password required");
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await auth.login(loginEmail, loginPassword);
      login(token, user);
      toast.success("Logged in");
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "driver") navigate("/driver");
      else navigate("/customer");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword) {
      toast.error("Email and password required");
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await auth.register({
        email: regEmail,
        password: regPassword,
        role: regRole,
        fullName: regName || undefined,
      });
      login(token, user);
      toast.success("Account created");
      if (user.role === "driver") navigate("/driver");
      else navigate("/customer");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">TrustRoute</span>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register" className="space-y-4 pt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label>Role</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={regRole === "customer" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setRegRole("customer")}
                  >
                    Customer
                  </Button>
                  <Button
                    type="button"
                    variant={regRole === "driver" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setRegRole("driver")}
                  >
                    Driver
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="reg-name">Full name (optional)</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    placeholder="Your name"
                    className="pl-9"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reg-email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
          ← Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default Login;
