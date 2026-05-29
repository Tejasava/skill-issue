import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/landing/Footer";
import { Search, Filter, Loader, ArrowRightLeft, Eye, X, Send } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { apiPost, apiGet } from "../lib/api";

interface UserSkill {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
  experienceLevel?: string;
  skillsKnown: string[];
  skillsWanted: string[];
  email?: string;
}

interface ExchangeData {
  requesterSkill: string;
  receiverSkill: string;
  exchangeType: "barter" | "paid" | "free";
  amount?: number;
  message: string;
}

const SkillsPage = () => {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSkill | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserSkill | null>(null);
  const [exchangeData, setExchangeData] = useState<ExchangeData>({
    requesterSkill: "",
    receiverSkill: "",
    exchangeType: "barter",
    message: "",
  });
  const [exchangeLoading, setExchangeLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!token) {
          setError("Please login to view skills");
          setLoading(false);
          return;
        }

        const response = await apiGet("/users", token);
        const data = await response.json();
        
        if (data.success) {
          // Filter out the current user
          const filteredUsers = data.data.filter((u: UserSkill) => u._id !== user?._id);
          setUsers(filteredUsers);
        } else {
          setError("Failed to load users");
        }
      } catch (err) {
        setError("Failed to fetch users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, user?._id]);

  // Fetch current user's full profile with skills when exchange modal opens
  useEffect(() => {
    if (showExchangeModal && user?._id && token && !currentUserProfile) {
      const fetchCurrentUserProfile = async () => {
        try {
          console.log("🔄 Fetching current user profile for exchange modal...");
          const response = await apiGet(`/users/${user._id}`, token);
          const data = await response.json();
          console.log("✅ Current user profile fetched:", data);
          if (data.success) {
            setCurrentUserProfile(data.data);
            console.log("📋 Available skills:", data.data?.skillsKnown);
          }
        } catch (err) {
          console.error("Failed to fetch current user profile:", err);
        }
      };
      fetchCurrentUserProfile();
    }
  }, [showExchangeModal, user?._id, token, currentUserProfile]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.skillsKnown.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    u.skillsWanted.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  // Handler function for sending exchange
  const handleSendExchange = async () => {
    console.log("📤 handleSendExchange CALLED");
    console.log("Token:", token ? "✓ Present" : "✗ Missing");
    console.log("selectedUser:", selectedUser?._id);
    console.log("exchangeData:", exchangeData);
    
    // Validation checks
    if (!token) {
      alert("Please login to send exchange request");
      return;
    }
    
    if (!selectedUser) {
      alert("Please select a user");
      return;
    }

    if (!exchangeData.requesterSkill) {
      alert("Please select your skill");
      return;
    }

    if (!exchangeData.receiverSkill) {
      alert("Please select the skill you want to learn");
      return;
    }

    if (!exchangeData.message.trim()) {
      alert("Please add a message");
      return;
    }

    setExchangeLoading(true);
    try {
      const payload = {
        receiver: selectedUser._id,
        requesterSkill: exchangeData.requesterSkill,
        receiverSkill: exchangeData.receiverSkill,
        exchangeType: exchangeData.exchangeType,
        amount: exchangeData.amount || 0,
        message: exchangeData.message,
      };
      
      console.log("📨 Sending exchange request with payload:", payload);
      console.log("📍 API endpoint: /exchanges");
      console.log("🔐 Token provided:", token.substring(0, 20) + "...");

      const response = await apiPost("/exchanges", payload, token);

      console.log("📊 Response status:", response.status);
      
      const data = await response.json();

      console.log("📦 Response data:", data);

      if (response.ok) {
        // Reset form
        setExchangeData({
          requesterSkill: "",
          receiverSkill: "",
          exchangeType: "barter",
          message: "",
        });
        setShowExchangeModal(false);
        setSelectedUser(null);
        alert("Exchange request sent successfully! 🎉");
      } else {
        alert(data.message || "Failed to send exchange request");
      }
    } catch (err) {
      console.error("❌ Error sending exchange:", err);
      alert("Error sending exchange request: " + (err as Error).message);
    } finally {
      setExchangeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Find Your <span className="gradient-text">Skill Match</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Discover developers and exchange skills through barter, paid sessions, or free mentoring.</p>
          </motion.div>

          <div className="flex items-center gap-4 mb-8 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills or names..."
                className="w-full pl-10 pr-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
              />
            </div>
            <button className="p-3 rounded-xl glass text-muted-foreground hover:text-foreground">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((user, i) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-6 card-hover"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-primary-foreground">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{user.name}</h3>
                    <div className="text-xs text-muted-foreground">{user.experienceLevel || 'Developer'}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-muted-foreground mb-1">Knows</div>
                  <div className="flex flex-wrap gap-1">
                    {user.skillsKnown.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-1">Wants to learn</div>
                  <div className="flex flex-wrap gap-1">
                    {user.skillsWanted.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-accent/15 text-accent">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (!token) {
                        navigate("/login");
                      } else {
                        setSelectedUser(user);
                        setShowProfileModal(true);
                      }
                    }} 
                    className="flex-1 btn-glow py-2 rounded-xl text-primary-foreground text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" /> View Profile
                  </button>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowProfileModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-display text-2xl font-bold">{selectedUser.name}'s Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="p-1 hover:bg-muted rounded-lg transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Info */}
              <div className="flex gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-primary-foreground overflow-hidden">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedUser.name.split(" ").map(n => n[0]).join("")}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.bio && <p className="text-sm mt-2">{selectedUser.bio}</p>}
                  {selectedUser.experienceLevel && (
                    <p className="text-xs text-primary font-medium mt-2">Level: {selectedUser.experienceLevel}</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-3">Skills Known</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skillsKnown.map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-full text-xs bg-primary/15 text-primary font-medium">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-3">Wants to Learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skillsWanted.map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-full text-xs bg-accent/15 text-accent font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exchange Button */}
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setShowExchangeModal(true);
                }}
                className="w-full btn-glow py-3 rounded-xl text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" /> Propose Skill Exchange
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Exchange Modal */}
      {showExchangeModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => {
          setShowExchangeModal(false);
          setCurrentUserProfile(null);
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display text-xl font-bold">Skill Exchange</h3>
                <p className="text-sm text-muted-foreground">With {selectedUser.name}</p>
              </div>
              <button onClick={() => {
                setShowExchangeModal(false);
                setCurrentUserProfile(null);
              }} className="p-1 hover:bg-muted rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Your Skill */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Your Skill</label>
                <select
                  value={exchangeData.requesterSkill}
                  onChange={(e) => setExchangeData({ ...exchangeData, requesterSkill: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">
                    {currentUserProfile?.skillsKnown && currentUserProfile.skillsKnown.length > 0 
                      ? "Select a skill you know" 
                      : "No skills added yet"}
                  </option>
                  {currentUserProfile?.skillsKnown && currentUserProfile.skillsKnown.length > 0 && (
                    currentUserProfile.skillsKnown.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Their Skill */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Want to Learn</label>
                <select
                  value={exchangeData.receiverSkill}
                  onChange={(e) => setExchangeData({ ...exchangeData, receiverSkill: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select their skill</option>
                  {selectedUser?.skillsKnown && selectedUser.skillsKnown.length > 0 ? (
                    selectedUser.skillsKnown.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))
                  ) : (
                    <option disabled>No skills available</option>
                  )}
                </select>
              </div>

              {/* Exchange Type */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Exchange Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "barter", label: "🔄 Barter", desc: "Swap" },
                    { value: "free", label: "🎁 Free", desc: "Free" },
                    { value: "paid", label: "💰 Paid", desc: "Payment" }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => setExchangeData({ ...exchangeData, exchangeType: type.value as "barter" | "paid" | "free" })}
                      className={`py-3 px-2 rounded-xl text-center text-xs font-medium transition-all ${
                        exchangeData.exchangeType === type.value
                          ? "bg-primary text-primary-foreground"
                          : "glass text-foreground hover:bg-muted"
                      }`}
                    >
                      <div>{type.label.split(" ")[0]}</div>
                      <div className="text-xs opacity-70">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount for Paid */}
              {exchangeData.exchangeType === "paid" && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Amount (per hour)</label>
                  <div className="flex items-center">
                    <span className="text-foreground mr-2">$</span>
                    <input
                      type="number"
                      min="0"
                      value={exchangeData.amount || ""}
                      onChange={(e) => setExchangeData({ ...exchangeData, amount: Number(e.target.value) })}
                      placeholder="50"
                      className="flex-1 px-3 py-2.5 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                <textarea
                  value={exchangeData.message}
                  onChange={(e) => setExchangeData({ ...exchangeData, message: e.target.value })}
                  placeholder="Hi! I'd love to exchange skills with you..."
                  className="w-full h-20 px-3 py-2.5 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent resize-none"
                  minLength={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {exchangeData.message.length}/500
                </p>
              </div>

              {/* Send Button */}
              <button
                disabled={exchangeLoading || !exchangeData.requesterSkill || !exchangeData.receiverSkill || !exchangeData.message.trim()}
                onClick={(e) => {
                  console.log("🔘 Button clicked");
                  console.log("Button disabled state:", {
                    exchangeLoading,
                    requesterSkill: !exchangeData.requesterSkill,
                    receiverSkill: !exchangeData.receiverSkill,
                    message: !exchangeData.message.trim()
                  });
                  handleSendExchange();
                }}
                className="w-full btn-glow py-3 rounded-xl text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title={
                  !exchangeData.requesterSkill ? "Select your skill" :
                  !exchangeData.receiverSkill ? "Select their skill" :
                  !exchangeData.message.trim() ? "Add a message" :
                  "Send exchange request"
                }
              >
                {exchangeLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Exchange Request
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default SkillsPage;
