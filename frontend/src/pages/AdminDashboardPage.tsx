import { motion } from "framer-motion";
import { AdminLayout } from "../components/AdminLayout";
import { Users, ArrowRightLeft, Trophy, FolderKanban, MessageSquare } from "lucide-react";

const stats = [
  { label: "Total Users", value: "2,450", icon: Users, color: "from-neon-blue to-neon-purple" },
  { label: "Active Exchanges", value: "156", icon: ArrowRightLeft, color: "from-neon-purple to-neon-cyan" },
  { label: "Ongoing Events", value: "8", icon: Trophy, color: "from-neon-cyan to-neon-blue" },
  { label: "Projects Listed", value: "342", icon: FolderKanban, color: "from-neon-blue to-neon-cyan" },
  { label: "Communities", value: "67", icon: MessageSquare, color: "from-neon-purple to-neon-blue" },
];

const recentUsers = [
  { name: "Alex Chen", email: "alex@example.com", skills: ["React", "Node.js"], joined: "Apr 12", status: "Active" },
  { name: "Priya Sharma", email: "priya@example.com", skills: ["Figma", "CSS"], joined: "Apr 11", status: "Active" },
  { name: "Jordan Davis", email: "jordan@example.com", skills: ["Python"], joined: "Apr 10", status: "Suspended" },
];

const AdminDashboardPage = () => (
  <AdminLayout>
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-8">Admin <span className="text-secondary">Dashboard</span></h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5 card-hover">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                <s.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-xl font-display font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Users table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-display font-semibold">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Skills</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Joined</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.email} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <div className="flex gap-1">{u.skills.map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary">{s}</span>)}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{u.joined}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === "Active" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"}`}>{u.status}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 rounded text-xs text-secondary hover:bg-secondary/10">Suspend</button>
                        <button className="px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  </AdminLayout>
);

export default AdminDashboardPage;
