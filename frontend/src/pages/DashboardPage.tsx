import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "../components/DashboardLayout";
import { ArrowRightLeft, FolderKanban, Trophy, Users, TrendingUp, Zap, Loader, Check, X } from "lucide-react";
import { apiGet, apiPut } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

interface UserProfile {
  _id: string;
  name: string;
  skillsKnown: string[];
  skillsWanted: string[];
}

interface Exchange {
  _id: string;
  requester: { _id: string; name: string; avatar?: string };
  receiver: { _id: string; name: string; avatar?: string };
  requesterSkill: string;
  receiverSkill: string;
  exchangeType: "barter" | "paid" | "free";
  amount?: number;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
}

const DashboardPage = () => {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState({
    exchangesDone: 0,
    projectsListed: 0,
    eventsJoined: 0,
    friends: 0,
  });
  const [recommendedUsers, setRecommendedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [incomingExchanges, setIncomingExchanges] = useState<Exchange[]>([]);
  const [incomingLoading, setIncomingLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [acceptedPartners, setAcceptedPartners] = useState<Exchange[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!token) return;

        // Fetch all users to find recommended matches
        const usersResponse = await fetch("http://localhost:5001/api/users", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const usersData = await usersResponse.json();
        
        if (usersData.success && usersData.data) {
          // Get users other than current user
          const otherUsers = usersData.data.filter((u: UserProfile) => u._id !== user?._id).slice(0, 3);
          setRecommendedUsers(otherUsers);
        }

        // Fetch user's exchanges stats
        const exchangesResponse = await fetch("http://localhost:5001/api/exchanges/my/stats", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (exchangesResponse.ok) {
          const exchangesData = await exchangesResponse.json();
          if (exchangesData.success) {
            setStats(prev => ({
              ...prev,
              exchangesDone: exchangesData.data.completed || 0,
            }));
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
    // fetch incoming exchanges for quick dashboard preview
    const fetchIncoming = async () => {
      try {
        if (!token) return;
        const resp = await apiGet('/exchanges/my', token);
        const data = await resp.json();
        if (data.success) {
          const incoming = data.data.filter((e: Exchange) => e.receiver._id === user?._id);
          setIncomingExchanges(incoming);
          // Also extract accepted exchanges (partners)
          const accepted = data.data.filter((e: Exchange) => e.status === 'accepted');
          setAcceptedPartners(accepted);
        }
      } catch (err) {
        console.error('Failed to fetch incoming exchanges:', err);
      } finally {
        setIncomingLoading(false);
        setPartnersLoading(false);
      }
    };
    fetchIncoming();
  }, [user, token]);

  const statItems = [
    { label: "Exchanges Done", value: stats.exchangesDone, icon: ArrowRightLeft, color: "from-neon-blue to-neon-purple" },
    { label: "Projects Listed", value: stats.projectsListed, icon: FolderKanban, color: "from-neon-purple to-neon-cyan" },
    { label: "Events Joined", value: stats.eventsJoined, icon: Trophy, color: "from-neon-cyan to-neon-blue" },
    { label: "Friends", value: stats.friends, icon: Users, color: "from-neon-blue to-neon-cyan" },
  ];

  // Respond to an incoming exchange (accept / reject)
  const handleRespond = async (exchangeId: string, action: "accept" | "reject") => {
    if (!token) return;
    setActionLoading(exchangeId);
    try {
      const response = await apiPut(`/exchanges/${exchangeId}/respond`, { action }, token);
      const data = await response.json();
      if (response.ok) {
        setIncomingExchanges(prev => prev.map(e => e._id === exchangeId ? { ...e, status: action === 'accept' ? 'accepted' : 'rejected' } : e));
      } else {
        alert(data.message || 'Failed to respond to exchange');
      }
    } catch (err) {
      console.error('Error responding to exchange:', err);
      alert('Error responding to exchange');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-accent" />
              <span className="text-sm text-accent font-medium">Welcome back</span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-1">Good Morning, {user?.name}! 👋</h1>
            <p className="text-muted-foreground">Ready to exchange some skills today?</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statItems.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-5 card-hover"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-2xl font-display font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity + Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {/* Incoming exchanges preview */}
              {incomingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : incomingExchanges.length > 0 ? (
                <div className="space-y-3">
                  {incomingExchanges.slice(0,3).map((e) => (
                    <div key={e._id} className="flex items-start gap-3 p-3 rounded-xl glass card-hover">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground overflow-hidden">
                        {e.requester.avatar ? (
                          <img src={e.requester.avatar} alt={e.requester.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{e.requester.name.split(" ").map(n => n[0]).join("")}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium">{e.requester.name}</div>
                            <div className="text-xs text-muted-foreground">{e.requesterSkill} → {e.receiverSkill}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleDateString()}</div>
                        </div>
                        <p className="text-sm text-foreground mt-2">{e.message}</p>
                        <div className="flex gap-2 mt-3">
                          {e.status === 'pending' && (
                            <>
                              <button
                                onClick={async () => handleRespond(e._id, 'accept')}
                                disabled={actionLoading === e._id}
                                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-600 hover:bg-green-500/30 text-xs font-medium disabled:opacity-50"
                              >
                                {actionLoading === e._id ? '...' : 'Accept'}
                              </button>
                              <button
                                onClick={async () => handleRespond(e._id, 'reject')}
                                disabled={actionLoading === e._id}
                                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 text-xs font-medium disabled:opacity-50"
                              >
                                {actionLoading === e._id ? '...' : 'Decline'}
                              </button>
                            </>
                          )}
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">{e.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No recent exchange requests
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-accent" /> Recommended Matches
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : recommendedUsers.length > 0 ? (
              <div className="space-y-3">
                {recommendedUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 rounded-xl glass card-hover">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.skillsWanted.slice(0, 2).join(" • ")}
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium btn-outline-glow">Exchange</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No users to match yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Exchange Partners / Friends Zone */}
        {acceptedPartners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" /> Exchange Partners
            </h2>
            {partnersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedPartners.map((exchange) => {
                  // Determine if current user is requester or receiver
                  const isRequester = exchange.requester._id === user?._id;
                  const partner = isRequester ? exchange.receiver : exchange.requester;
                  const userSkill = isRequester ? exchange.requesterSkill : exchange.receiverSkill;
                  const partnerSkill = isRequester ? exchange.receiverSkill : exchange.requesterSkill;

                  return (
                    <motion.div
                      key={exchange._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass rounded-2xl p-5 card-hover"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground overflow-hidden">
                          {partner.avatar ? (
                            <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{partner.name.split(" ").map(n => n[0]).join("")}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{partner.name}</h3>
                          <div className="text-xs text-muted-foreground mt-1">
                            ✓ Connected
                          </div>
                        </div>
                      </div>

                      <div className="bg-background/40 rounded-xl p-3 mb-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">You offer:</span>
                          <span className="font-medium text-primary">{userSkill}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">They offer:</span>
                          <span className="font-medium text-accent">{partnerSkill}</span>
                        </div>
                      </div>

                      {exchange.exchangeType === 'paid' && exchange.amount && (
                        <div className="text-xs text-muted-foreground mb-3 px-2 py-1 bg-secondary/10 rounded-lg">
                          💰 ${exchange.amount}/hour
                        </div>
                      )}

                      <button className="w-full py-2 px-3 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-medium transition-all">
                        Start Exchange
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
