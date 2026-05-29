import { motion } from "framer-motion";
import { AdminLayout } from "../components/AdminLayout";
import { useState, useEffect } from "react";
import { Check, X, Eye, Trash2, AlertCircle, Loader } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface Community {
  _id: string;
  name: string;
  description: string;
  tags: string[];
  creator: {
    _id: string;
    name: string;
    avatar: string;
  };
  memberCount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectionReason?: string;
  isAdminCreated?: boolean;
}

interface Tab {
  id: "pending" | "approved" | "rejected" | "all";
  label: string;
  count: number;
  icon: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface MembersModal {
  isOpen: boolean;
  communityId: string | null;
  communityName: string;
  members: Member[];
}

const AdminCommunitiesPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [membersModal, setMembersModal] = useState<MembersModal>({
    isOpen: false,
    communityId: null,
    communityName: "",
    members: []
  });
  const [loadingMembers, setLoadingMembers] = useState(false);
  const { toast } = useToast();

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found in localStorage");
        toast({
          title: "Error",
          description: "Not authenticated. Please login again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5001/api/admin/communities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCommunities(data.data || []);
        const pending = (data.data || []).filter((c: Community) => c.status === "pending").length;
        setPendingCount(pending);
      } else {
        console.error("API error:", data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to load communities",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast({
        title: "Error",
        description: "Failed to load communities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (communityId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Not authenticated",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:5001/api/admin/communities/${communityId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Community approved successfully",
        });
        await fetchCommunities();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to approve community",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving community:", error);
      toast({
        title: "Error",
        description: "Failed to approve community",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (communityId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Not authenticated",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:5001/api/admin/communities/${communityId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Community rejected",
        });
        setRejectingId(null);
        setRejectionReason("");
        await fetchCommunities();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reject community",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting community:", error);
      toast({
        title: "Error",
        description: "Failed to reject community",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (communityId: string) => {
    if (!window.confirm("Are you sure you want to delete this community?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Not authenticated",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:5001/api/admin/communities/${communityId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Community deleted successfully",
        });
        await fetchCommunities();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete community",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting community:", error);
      toast({
        title: "Error",
        description: "Failed to delete community",
        variant: "destructive",
      });
    }
  };

  const handleViewMembers = async (communityId: string, communityName: string) => {
    try {
      setLoadingMembers(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast({
          title: "Error",
          description: "Not authenticated",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:5001/api/admin/communities/${communityId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMembersModal({
          isOpen: true,
          communityId,
          communityName,
          members: data.data.members || []
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load community members",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to load community members",
        variant: "destructive",
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const getFilteredCommunities = () => {
    if (activeTab === "all") return communities;
    return communities.filter((c) => c.status === activeTab);
  };

  const filteredCommunities = getFilteredCommunities();

  const tabs = [
    { id: "pending", label: "Pending", count: pendingCount, icon: "⏳" },
    { id: "approved", label: "Approved", count: communities.filter((c) => c.status === "approved").length, icon: "✅" },
    { id: "rejected", label: "Rejected", count: communities.filter((c) => c.status === "rejected").length, icon: "❌" },
    { id: "all", label: "All", count: communities.length, icon: "📋" },
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "approved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">
                Manage <span className="text-secondary">Communities</span>
              </h1>
              <p className="text-muted-foreground">Review and manage community submissions</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {tabs.map((tab: Tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "glass hover:bg-primary/10"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                <span className="ml-1 text-xs opacity-75">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading communities...</p>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Eye className="w-8 h-8 opacity-50 mx-auto mb-4" />
              <p className="text-muted-foreground">No communities to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommunities.map((community) => (
                <motion.div
                  key={community._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-sm font-bold">
                          {community.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{community.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {community.creator?.name || "Unknown"} • {community.memberCount} members
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{community.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {community.tags?.map((tag) => (
                          <span key={tag} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created: {new Date(community.createdAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full border ${getStatusBadgeColor(community.status)}`}>
                          {community.status.toUpperCase()}
                        </span>
                        {community.rejectionReason && (
                          <div className="flex items-center gap-1 text-red-500">
                            <AlertCircle className="w-4 h-4" />
                            <span>Reason: {community.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewMembers(community._id, community.name)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
                        title="View Members"
                        disabled={loadingMembers}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {community.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(community._id)}
                            className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setRejectingId(community._id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {community.status !== "pending" && (
                        <button
                          onClick={() => handleDelete(community._id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rejection Modal */}
                  {rejectingId === community._id && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-4 border-t border-primary/20">
                      <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this community is being rejected..."
                        className="w-full p-3 rounded-lg glass text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent mb-3"
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason("");
                          }}
                          className="px-4 py-2 rounded-lg glass hover:bg-primary/10 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReject(community._id)}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Members Modal */}
        {membersModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setMembersModal({ ...membersModal, isOpen: false })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">{membersModal.communityName}</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Total Members: {membersModal.members.length}
                  </p>
                </div>
                <button
                  onClick={() => setMembersModal({ ...membersModal, isOpen: false })}
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : membersModal.members.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No members in this community yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {membersModal.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all"
                    >
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-sm font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{member.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                            <span className="font-semibold">Email:</span>
                            <span className="truncate">{member.email}</span>
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                            <span className="font-semibold">Phone:</span>
                            <span className="truncate">{member.phone}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setMembersModal({ ...membersModal, isOpen: false })}
                  className="px-4 py-2 rounded-lg glass hover:bg-primary/10 transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCommunitiesPage;
