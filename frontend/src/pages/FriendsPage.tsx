import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { Search, UserPlus, Check, X, Loader, MessageCircle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { apiPost, apiPut, apiGet } from "../lib/api";

interface Friend {
  _id: string;
  name: string;
  skillsKnown: string[];
  skillsWanted: string[];
  avatar?: string;
}

interface FriendRequest {
  _id: string;
  from: Friend;
  to: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

const FriendsPage = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"friends" | "requests" | "find">("friends");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [allUsers, setAllUsers] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token || !user) return;

        // Fetch all users for find tab
        const usersResponse = await fetch("http://localhost:5001/api/users", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const usersData = await usersResponse.json();
        if (usersData.success) {
          const otherUsers = usersData.data.filter((u: Friend) => u._id !== user._id);
          setAllUsers(otherUsers);
        }

        // Fetch friends
        const friendsResponse = await fetch("http://localhost:5001/api/friends", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          if (friendsData.success) {
            setFriends(friendsData.data || []);
          }
        }

        // Fetch friend requests
        const requestsResponse = await fetch("http://localhost:5001/api/friends/requests", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          if (requestsData.success) {
            setRequests(requestsData.data || []);
          }
        }

        setError("");
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  const filteredFindUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.skillsKnown.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Check if user is already a friend
  const isFriend = (userId: string) => friends.some(f => f._id === userId);

  // Check if friend request is pending
  const isPendingRequest = (userId: string) => sentRequests.includes(userId);

  // Send friend request
  const handleSendRequest = async (userId: string) => {
    if (!token) return;
    setActionLoading(userId);
    try {
      const response = await apiPost(`/friends/request/${userId}`, {}, token);
      const data = await response.json();
      if (response.ok) {
        setSentRequests([...sentRequests, userId]);
        alert("Friend request sent!");
      } else {
        alert(data.message || "Failed to send request");
      }
    } catch (err) {
      console.error("Error sending friend request:", err);
      alert("Error sending request");
    } finally {
      setActionLoading(null);
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (requestId: string) => {
    if (!token) return;
    setActionLoading(requestId);
    try {
      const response = await apiPut(`/friends/request/${requestId}/accept`, {}, token);
      const data = await response.json();
      if (response.ok) {
        // Remove from requests and add to friends
        const acceptedRequest = requests.find(r => r._id === requestId);
        if (acceptedRequest) {
          setFriends([...friends, acceptedRequest.from]);
          setRequests(requests.filter(r => r._id !== requestId));
          // Remove from all users so they don't appear in "Find Friends" anymore
          setSentRequests(sentRequests.filter(id => id !== acceptedRequest.from._id));
        }
        alert("Friend added!");
      } else {
        alert(data.message || "Failed to accept request");
      }
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Error accepting request");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject friend request
  const handleRejectRequest = async (requestId: string) => {
    if (!token) return;
    setActionLoading(requestId);
    try {
      const response = await apiPut(`/friends/request/${requestId}/reject`, {}, token);
      const data = await response.json();
      if (response.ok) {
        setRequests(requests.filter(r => r._id !== requestId));
        alert("Request rejected");
      } else {
        alert(data.message || "Failed to reject request");
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Error rejecting request");
    } finally {
      setActionLoading(null);
    }
  };

  // Start/Get conversation and navigate to chat
  const handleStartChat = async (friendId: string) => {
    if (!token) return;
    try {
      const response = await apiPost(`/chat/conversations`, { userId: friendId }, token);
      const data = await response.json();
      if (data.success) {
        // Chat page is mounted under /dashboard/chat
        navigate(`/dashboard/chat?with=${friendId}`, { state: { conversationId: data.data._id } });
      } else {
        alert("Failed to start conversation");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("Error starting chat");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-6">
            <span className="gradient-text">Friends</span>
          </h1>

          <div className="flex gap-2 mb-8">
            {(["friends", "requests", "find"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                  tab === t ? "bg-primary/20 text-primary" : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "friends" ? `My Friends (${friends.length})` : t === "requests" ? `Requests (${requests.length})` : "Find Friends"}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {tab === "friends" && (
            <div>
              {friends.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground">No friends yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {friends.map((f) => (
                    <motion.div
                      key={f._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-2xl p-5 card-hover"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-primary-foreground text-sm overflow-hidden">
                          {f.avatar ? (
                            <img src={f.avatar} alt={f.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{f.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{f.name}</div>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {f.skillsKnown.slice(0, 2).map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartChat(f._id)}
                        className="w-full py-2 px-3 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-xs font-medium flex items-center justify-center gap-2 transition-all"
                      >
                        <MessageCircle className="w-4 h-4" /> Chat
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "requests" && (
            <div>
              {requests.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground">No pending friend requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((r) => (
                    <div key={r._id} className="glass rounded-2xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground overflow-hidden">
                          {r.from.avatar ? (
                            <img src={r.from.avatar} alt={r.from.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{r.from.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{r.from.name}</div>
                          <div className="flex gap-1 mt-0.5">
                            {r.from.skillsKnown.slice(0, 2).map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-secondary/15 text-secondary">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(r._id)}
                          disabled={actionLoading === r._id}
                          className="p-2 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50 transition-all"
                        >
                          {actionLoading === r._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(r._id)}
                          disabled={actionLoading === r._id}
                          className="p-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 disabled:opacity-50 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "find" && (
            <div>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                />
              </div>
              {filteredFindUsers.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredFindUsers.map((user) => (
                    <div key={user._id} className="glass rounded-2xl p-5 flex items-center justify-between card-hover">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{user.name.split(" ").map(n => n[0]).join("").toUpperCase()}</span>
                          )}
                        </div>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                      {isFriend(user._id) ? (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 bg-green-500/20 text-green-500 cursor-default"
                        >
                          <Check className="w-3 h-3" /> Friend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(user._id)}
                          disabled={actionLoading === user._id || isPendingRequest(user._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium btn-glow text-primary-foreground flex items-center gap-1 disabled:opacity-50 transition-all"
                        >
                          {actionLoading === user._id ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : isPendingRequest(user._id) ? (
                            "Requested"
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" /> Add
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default FriendsPage;
