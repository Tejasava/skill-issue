import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/landing/Footer";
import { Users, Plus, Lock, Globe, AlertCircle, Loader, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { apiGet, apiPost } from "../lib/api";
import { useToast } from "../hooks/use-toast";

interface Community {
  _id: string;
  name: string;
  description: string;
  tags: string[];
  privacy: "public" | "private";
  status: "pending" | "approved" | "rejected";
  memberCount: number;
  members: string[];
  creator: { _id: string; name: string; email: string };
  isAdminCreated: boolean;
}

interface MemberDetail {
  userId: string;
  userName: string;
  userAvatar: string;
  email: string;
  phone: string;
  joinedAt: string;
}

const CommunityPage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState<string | null>(null);
  const [showMembersModal, setShowMembersModal] = useState<string | null>(null);
  const [memberDetails, setMemberDetails] = useState<MemberDetail[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null);
  const [joinFormData, setJoinFormData] = useState({
    phone: "",
    email: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    privacy: "public",
  });
  const { token, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // Fetch communities on mount
  useEffect(() => {
    fetchCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await apiGet("/communities", token || undefined);
      if (response.ok) {
        const data = await response.json();
        setCommunities(data.data || []);
      } else {
        console.error("Failed to fetch communities");
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast({ title: "Error", description: "Failed to load communities", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" });
      return;
    }

    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Community name is required", variant: "destructive" });
      return;
    }

    try {
      setCreatingCommunity(true);
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        tags: tagsArray,
        privacy: formData.privacy,
      };

      const response = await apiPost("/communities", payload, token);
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "Community created! Waiting for admin approval.",
        });
        setFormData({ name: "", description: "", tags: "", privacy: "public" });
        setShowCreate(false);
        fetchCommunities();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create community",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating community:", error);
      toast({
        title: "Error",
        description: "Failed to create community",
        variant: "destructive",
      });
    } finally {
      setCreatingCommunity(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!isAuthenticated || !token) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" });
      return;
    }

    if (!joinFormData.phone.trim() || !joinFormData.email.trim()) {
      toast({ title: "Error", description: "Phone and email are required", variant: "destructive" });
      return;
    }

    try {
      setJoiningCommunity(communityId);
      const response = await apiPost(`/communities/${communityId}/join`, {
        phone: joinFormData.phone.trim(),
        email: joinFormData.email.trim(),
      }, token);
      const data = await response.json();

      if (response.ok) {
        toast({ title: "Success", description: "Joined community!" });
        setJoinFormData({ phone: "", email: "" });
        setShowJoinModal(null);
        fetchCommunities();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to join community",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error joining community:", error);
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive",
      });
    } finally {
      setJoiningCommunity(null);
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!isAuthenticated || !token) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" });
      return;
    }

    try {
      setJoiningCommunity(communityId);
      const response = await apiPost(`/communities/${communityId}/leave`, {}, token);
      const data = await response.json();

      if (response.ok) {
        toast({ title: "Success", description: "Left community" });
        fetchCommunities();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to leave community",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error leaving community:", error);
      toast({
        title: "Error",
        description: "Failed to leave community",
        variant: "destructive",
      });
    } finally {
      setJoiningCommunity(null);
    }
  };

  const isUserMember = (community: Community) => {
    if (!token || !isAuthenticated) return false;
    return community.members.includes(localStorage.getItem("userId") || "");
  };

  const handleViewMembers = async (communityId: string) => {
    try {
      setLoadingMembers(true);
      setShowMembersModal(communityId);
      // No token required - endpoint is public
      const response = await apiGet(`/communities/${communityId}/members`);
      const data = await response.json();

      if (response.ok) {
        setMemberDetails(data.data.memberDetails || []);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load members",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">
                <span className="gradient-text">Communities</span>
              </h1>
              <p className="text-muted-foreground">Join communities, share knowledge, and collaborate.</p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreate(true)}
                className="btn-glow px-5 py-2.5 rounded-xl text-primary-foreground font-bold text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Community
              </button>
            )}
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : communities.length === 0 ? (
            <div className="flex justify-center items-center h-64 flex-col gap-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No communities yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community, i) => {
                const isMember = community.members.some(
                  (memberId) => memberId === localStorage.getItem("userId")
                );

                return (
                  <motion.div
                    key={community._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-2xl p-6 card-hover"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-1">
                          {community.name}
                          {community.privacy === "private" && <Lock className="w-3 h-3 text-muted-foreground" />}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {community.privacy === "public" ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          {community.memberCount} members
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{community.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {community.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs bg-secondary/15 text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {community.status === "pending" ? (
                      <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center bg-yellow-500/20 text-yellow-600 border border-yellow-500/30">
                        ⏳ Pending Approval
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleViewMembers(community._id)}
                          className="w-full py-2.5 rounded-xl text-sm font-medium glass text-primary border border-primary/30 hover:bg-primary/10 transition-all"
                        >
                          View Members ({community.memberCount})
                        </button>
                        <button
                          onClick={() =>
                            isMember
                              ? handleLeaveCommunity(community._id)
                              : setShowJoinModal(community._id)
                          }
                          disabled={joiningCommunity === community._id}
                          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isMember
                              ? "glass text-primary border border-primary/30 hover:bg-primary/10"
                              : "btn-glow text-primary-foreground font-bold hover:scale-105"
                          } ${joiningCommunity === community._id ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {joiningCommunity === community._id ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader className="w-4 h-4 animate-spin" />
                            </span>
                          ) : isMember ? (
                            "Joined ✓"
                          ) : (
                            "Join Community"
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setShowCreate(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold mb-4">Create Community</h3>
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Community Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter community name"
                  className="w-full p-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your community"
                  className="w-full h-20 p-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. React, Frontend, Web Development"
                  className="w-full p-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Privacy
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy: "public" })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.privacy === "public"
                        ? "btn-glow text-primary-foreground"
                        : "glass text-foreground hover:bg-primary/10"
                    }`}
                  >
                    🌍 Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, privacy: "private" })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.privacy === "private"
                        ? "btn-glow text-primary-foreground"
                        : "glass text-foreground hover:bg-primary/10"
                    }`}
                  >
                    🔒 Private
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-xl glass text-sm text-foreground font-medium hover:bg-primary/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCommunity}
                  className="flex-1 btn-glow py-2 rounded-xl text-primary-foreground font-bold text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingCommunity ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                    </span>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Join Community Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl p-6 max-w-md w-full backdrop-blur-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Join Community</h2>
              <button
                onClick={() => setShowJoinModal(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Please provide your contact information to join this community.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleJoinCommunity(showJoinModal);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={joinFormData.email}
                  onChange={(e) => setJoinFormData({ ...joinFormData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={joinFormData.phone}
                  onChange={(e) => setJoinFormData({ ...joinFormData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none transition-all"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(null)}
                  className="flex-1 py-2 rounded-xl glass text-sm text-foreground font-medium hover:bg-primary/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joiningCommunity !== null}
                  className="flex-1 btn-glow py-2 rounded-xl text-primary-foreground font-bold text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joiningCommunity ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                    </span>
                  ) : (
                    "Join Community"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto backdrop-blur-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Community Members</h2>
              <button
                onClick={() => setShowMembersModal(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingMembers ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : memberDetails.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No members yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {memberDetails.map((member, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary-foreground">
                            {member.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{member.userName}</p>
                          {member.email && <p className="text-xs text-muted-foreground truncate">{member.email}</p>}
                          {member.phone && <p className="text-xs text-muted-foreground">📱 {member.phone}</p>}
                          {!member.email && !member.phone && (
                            <p className="text-xs text-muted-foreground italic">Contact info restricted to admin/creator</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined: {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-6 mt-6 border-t border-white/10">
              <button
                onClick={() => setShowMembersModal(null)}
                className="flex-1 py-2 rounded-xl glass text-sm text-foreground font-medium hover:bg-primary/10 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CommunityPage;
