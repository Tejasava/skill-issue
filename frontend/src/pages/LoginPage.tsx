import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Mail, Lock, Shield, AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { apiPost } from "../lib/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      if (isAdmin) {
        // Admin login
        if (!adminId.trim() || !password) {
          setError("Please fill in all fields");
          return;
        }

        const response = await apiPost("/auth/admin/login", {
          adminId,
          password,
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Admin login failed");
          return;
        }

        login(data.data.user, data.data.token);
        navigate("/admin");
      } else {
        // User login
        if (!email.trim() || !password) {
          setError("Please fill in all fields");
          return;
        }

        const response = await apiPost("/auth/login", {
          email,
          password,
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Login failed");
          return;
        }

        login(data.data.user, data.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold gradient-text">Skill Issue</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-muted-foreground text-center text-sm mb-8">Sign in to continue your journey</p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-500">{error}</span>
            </div>
          )}

          {/* Admin toggle */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={() => setIsAdmin(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !isAdmin ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              User
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                isAdmin ? "bg-secondary/20 text-secondary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-4 h-4" /> Admin
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isAdmin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Admin ID</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Enter admin ID"
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-glow py-3 rounded-xl text-primary-foreground font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (isAdmin ? "Logging in as Admin..." : "Signing in...") : (isAdmin ? "Login as Admin" : "Sign In")}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
