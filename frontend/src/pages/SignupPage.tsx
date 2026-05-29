import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Mail, Lock, User, X, AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { apiPost } from "../lib/api";

const skillOptions = ["React", "Node.js", "Python", "TypeScript", "Go", "Rust", "Vue", "Angular", "Django", "Flask", "AWS", "Docker", "Figma", "Swift", "Kotlin", "Java", "C++", "Ruby", "GraphQL", "MongoDB"];

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [skillsKnown, setSkillsKnown] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(skill) ? list.filter((s) => s !== skill) : [...list, skill]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await apiPost("/auth/register", {
        name,
        email,
        password,
        skillsKnown,
        skillsWanted,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // Store token and user data
      login(data.data.user, data.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="glass-strong rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold gradient-text">Skill Issue</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-center mb-2">Create Account</h2>
          <p className="text-muted-foreground text-center text-sm mb-6">Join the skill exchange revolution</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-500">{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPassword ? "Hide" : "Show"} passwords
              </button>
            </div>

            {/* Skills I Know */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Skills I Know</label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={`know-${skill}`}
                    type="button"
                    onClick={() => toggleSkill(skill, skillsKnown, setSkillsKnown)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      skillsKnown.includes(skill)
                        ? "bg-primary/20 text-primary border border-primary/50"
                        : "glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {skill}
                    {skillsKnown.includes(skill) && <X className="w-3 h-3 inline ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills I Want */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Skills I Want to Learn</label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={`want-${skill}`}
                    type="button"
                    onClick={() => toggleSkill(skill, skillsWanted, setSkillsWanted)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      skillsWanted.includes(skill)
                        ? "bg-accent/20 text-accent border border-accent/50"
                        : "glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {skill}
                    {skillsWanted.includes(skill) && <X className="w-3 h-3 inline ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-glow py-3 rounded-xl text-primary-foreground font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
