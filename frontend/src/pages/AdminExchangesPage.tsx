import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "../components/AdminLayout";
import { Loader, Trash2, ArrowRightLeft, AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

interface Exchange {
  _id: string;
  requester?: {
    _id: string;
    name: string;
    email: string;
  };
  receiver?: {
    _id: string;
    name: string;
    email: string;
  };
  requesterSkill?: string;
  receiverSkill?: string;
  exchangeType?: string;
  amount?: number;
  message?: string;
  status?: string;
  createdAt?: string;
}

const AdminExchangesPage = () => {
  const { token } = useAuthStore();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshInterval] = useState(5000); // 5 seconds

  // Fetch exchanges function with useCallback to avoid dependency issues
  const fetchExchanges = useCallback(async (showLoader = true) => {
    try {
      if (!token) {
        setError("Not authenticated");
        if (showLoader) setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5001/api/admin/exchanges", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setExchanges(data.data || []);
        setError("");
      } else {
        setError(data.message || "Failed to load exchanges");
      }
    } catch (err) {
      setError("Failed to fetch exchanges");
      console.error(err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [token]);

  // Initial load and polling setup
  useEffect(() => {
    fetchExchanges(true);

    // Set up auto-refresh polling
    const pollInterval = setInterval(() => {
      fetchExchanges(false); // Don't show loader on auto-refresh
    }, refreshInterval);

    return () => clearInterval(pollInterval);
  }, [fetchExchanges, refreshInterval]);

  // Listen for visibility changes to refresh when tab comes into focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchExchanges(false); // Refresh when tab becomes visible
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchExchanges]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-accent/20 text-accent";
      case "accepted":
        return "bg-primary/20 text-primary";
      case "pending":
        return "bg-secondary/20 text-secondary";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getExchangeTypeColor = (type?: string) => {
    switch (type) {
      case "barter":
        return "bg-blue-500/20 text-blue-400";
      case "paid":
        return "bg-yellow-500/20 text-yellow-400";
      case "free":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleDeleteExchange = async (exchangeId: string) => {
    if (!window.confirm("Are you sure you want to delete this skill exchange?")) return;

    try {
      setDeleting(exchangeId);
      const response = await fetch(`http://localhost:5001/api/admin/exchanges/${exchangeId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setExchanges(exchanges.filter(e => e._id !== exchangeId));
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete exchange");
      }
    } catch (err) {
      console.error("Failed to delete exchange", err);
      setError("Failed to delete exchange");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-8">
            Skill <span className="text-secondary">Exchanges</span>
          </h1>

          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-8 text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          ) : exchanges.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <ArrowRightLeft className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No skill exchanges found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exchanges.map((exchange, idx) => (
                <motion.div
                  key={exchange._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass rounded-2xl p-6 hover:bg-muted/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left side - Requester info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Requester</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {exchange.requester && typeof exchange.requester === "object" ? exchange.requester.name : "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exchange.requester && typeof exchange.requester === "object" ? exchange.requester.email : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Middle - Exchange details */}
                    <div className="flex-1">
                      <div className="flex flex-col gap-3">
                        {/* Offering skill */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Offering</p>
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-primary/15 text-primary">
                            {exchange.requesterSkill || "N/A"}
                          </span>
                        </div>

                        {/* Arrow and exchange type */}
                        <div className="flex items-center gap-2 justify-center">
                          <ArrowRightLeft className="w-4 h-4 text-secondary rotate-90" />
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase ${getExchangeTypeColor(exchange.exchangeType)}`}>
                            {exchange.exchangeType || "N/A"}
                          </span>
                          {exchange.amount && exchange.exchangeType === "paid" && (
                            <span className="text-xs font-semibold text-accent">₹{exchange.amount}</span>
                          )}
                        </div>

                        {/* Requesting skill */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Requesting</p>
                          <span className="px-3 py-1 rounded-lg text-sm font-medium bg-accent/15 text-accent">
                            {exchange.receiverSkill || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Receiver info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Receiver</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {exchange.receiver && typeof exchange.receiver === "object" ? exchange.receiver.name : "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exchange.receiver && typeof exchange.receiver === "object" ? exchange.receiver.email : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Status and Date */}
                    <div className="flex-1">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold inline-block ${getStatusColor(exchange.status)}`}>
                            {exchange.status || "pending"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Date</p>
                          <p className="text-xs font-medium text-foreground">
                            {exchange.createdAt ? new Date(exchange.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            }) : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message and Action */}
                    <div className="flex-1 flex flex-col gap-2">
                      {exchange.message && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Message</p>
                          <p className="text-xs bg-muted/50 p-2 rounded line-clamp-2 text-foreground">
                            {exchange.message}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteExchange(exchange._id)}
                        disabled={deleting === exchange._id}
                        className="mt-auto btn-glow-destructive px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border border-destructive/30"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleting === exchange._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminExchangesPage;
