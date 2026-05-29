import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "../components/DashboardLayout";
import { ArrowRightLeft, Loader, Check, X, AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { apiGet, apiPut } from "../lib/api";

interface Exchange {
  _id: string;
  requester: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
    avatar?: string;
  };
  requesterSkill: string;
  receiverSkill: string;
  exchangeType: "barter" | "paid" | "free";
  amount?: number;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
}

const ExchangesPage = () => {
  const { token, user } = useAuthStore();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchExchanges = async () => {
    try {
      if (!token) return;
      const response = await apiGet("/exchanges/my", token);
      const data = await response.json();

      if (data.success) {
        setExchanges(data.data);
      } else {
        setError("Failed to load exchanges");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch exchanges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRespond = async (exchangeId: string, action: "accept" | "reject") => {
    if (!token) return;

    setActionLoading(exchangeId);
    try {
      const response = await apiPut(
        `/exchanges/${exchangeId}/respond`,
        { action },
        token
      );

      const data = await response.json();

      if (response.ok) {
        // Update the local state
        setExchanges(
          exchanges.map(e =>
            e._id === exchangeId ? { ...e, status: action === "accept" ? "accepted" : "rejected" } : e
          )
        );
      } else {
        alert(data.message || "Failed to respond to exchange");
      }
    } catch (err) {
      console.error(err);
      alert("Error responding to exchange");
    } finally {
      setActionLoading(null);
    }
  };

  const getExchangeTypeIcon = (type: string) => {
    switch (type) {
      case "barter":
        return "🔄";
      case "paid":
        return "💰";
      case "free":
        return "🎁";
      default:
        return "❓";
    }
  };

  const getExchangeTypeLabel = (type: string) => {
    switch (type) {
      case "barter":
        return "Barter Swap";
      case "paid":
        return "Paid";
      case "free":
        return "Free";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-600";
      case "accepted":
        return "bg-green-500/20 text-green-600";
      case "rejected":
        return "bg-red-500/20 text-red-600";
      case "completed":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Separate incoming and outgoing exchanges
  const incomingExchanges = exchanges.filter(e => e.receiver._id === user?._id);
  const outgoingExchanges = exchanges.filter(e => e.requester._id === user?._id);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-2">
            <ArrowRightLeft className="w-7 h-7 text-primary" />
            <span className="gradient-text">Skill Exchanges</span>
          </h1>

          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-500">{error}</p>
            </div>
          ) : exchanges.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <ArrowRightLeft className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No exchanges yet. Go to Skills to find someone to exchange with!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Incoming Exchanges */}
              {incomingExchanges.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-4">📥 Incoming Requests</h2>
                  <div className="space-y-3">
                    {incomingExchanges.map((e) => (
                      <motion.div
                        key={e._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl p-5 card-hover"
                      >
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground overflow-hidden flex-shrink-0">
                                {e.requester.avatar ? (
                                  <img src={e.requester.avatar} alt={e.requester.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{e.requester.name.split(" ").map(n => n[0]).join("")}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{e.requester.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Wants to exchange <span className="font-medium text-foreground">{e.requesterSkill}</span> for{" "}
                                  <span className="font-medium text-foreground">{e.receiverSkill}</span>
                                </p>
                              </div>
                            </div>
                            <div className="ml-15 space-y-2">
                              <p className="text-sm text-foreground">{e.message}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(e.status)}`}>
                                  {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/15 text-primary">
                                  {getExchangeTypeIcon(e.exchangeType)} {getExchangeTypeLabel(e.exchangeType)}
                                </span>
                                {e.exchangeType === "paid" && e.amount && (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary/15 text-secondary">
                                    ${e.amount}/hour
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {e.status === "pending" && (
                            <div className="flex gap-2 sm:flex-col justify-end">
                              <button
                                disabled={actionLoading === e._id}
                                onClick={() => handleRespond(e._id, "accept")}
                                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-600 hover:bg-green-500/30 font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-all"
                              >
                                {actionLoading === e._id ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                                Accept
                              </button>
                              <button
                                disabled={actionLoading === e._id}
                                onClick={() => handleRespond(e._id, "reject")}
                                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-all"
                              >
                                <X className="w-4 h-4" /> Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outgoing Exchanges */}
              {outgoingExchanges.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-4">📤 Outgoing Requests</h2>
                  <div className="space-y-3">
                    {outgoingExchanges.map((e) => (
                      <motion.div
                        key={e._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl p-5 card-hover"
                      >
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground overflow-hidden flex-shrink-0">
                                {e.receiver.avatar ? (
                                  <img src={e.receiver.avatar} alt={e.receiver.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{e.receiver.name.split(" ").map(n => n[0]).join("")}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{e.receiver.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Offering <span className="font-medium text-foreground">{e.requesterSkill}</span> for{" "}
                                  <span className="font-medium text-foreground">{e.receiverSkill}</span>
                                </p>
                              </div>
                            </div>
                            <div className="ml-15 space-y-2">
                              <p className="text-sm text-foreground">{e.message}</p>
                              <div className="flex flex-wrap gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(e.status)}`}>
                                  {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/15 text-primary">
                                  {getExchangeTypeIcon(e.exchangeType)} {getExchangeTypeLabel(e.exchangeType)}
                                </span>
                                {e.exchangeType === "paid" && e.amount && (
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary/15 text-secondary">
                                    ${e.amount}/hour
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ExchangesPage;
