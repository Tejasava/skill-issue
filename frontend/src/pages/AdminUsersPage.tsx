import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "../components/AdminLayout";
import { Loader, Trash2, Ban } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

interface User {
  _id: string;
  name: string;
  email: string;
  skillsKnown: string[];
  experienceLevel?: string;
  createdAt?: string;
  isActive?: boolean;
}

const AdminUsersPage = () => {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5001/api/admin/users", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          setUsers(data.data || []);
        } else {
          setError(data.message || "Failed to load users");
        }
      } catch (err) {
        setError("Failed to fetch users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleSuspend = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}/suspend`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: false } : u));
      }
    } catch (err) {
      console.error("Failed to suspend user", err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-8">
            Manage <span className="text-secondary">Users</span>
          </h1>

          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      <th className="text-left p-4 text-muted-foreground font-medium">Name</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Skills</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Level</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{user.name}</td>
                        <td className="p-4 text-muted-foreground text-xs">{user.email}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {user.skillsKnown.slice(0, 3).map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary">
                                {s}
                              </span>
                            ))}
                            {user.skillsKnown.length > 3 && (
                              <span className="px-2 py-0.5 rounded-full text-xs text-muted-foreground">
                                +{user.skillsKnown.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{user.experienceLevel || "Not set"}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive !== false ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                          }`}>
                            {user.isActive !== false ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSuspend(user._id)}
                              disabled={user.isActive === false}
                              className="p-2 rounded text-xs text-secondary hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              title="Suspend user"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="p-2 rounded text-xs text-destructive hover:bg-destructive/10 transition-all"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
