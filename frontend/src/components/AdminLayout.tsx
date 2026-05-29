import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useState } from "react";
import {
  LayoutDashboard, Users, ArrowRightLeft, Trophy, FolderKanban, MessageSquare, Flag, LogOut, Menu, Zap, Shield
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "../stores/authStore";

const adminLinks = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Exchanges", path: "/admin/exchanges", icon: ArrowRightLeft },
  { name: "Events", path: "/admin/events", icon: Trophy },
  { name: "Communities", path: "/admin/communities", icon: MessageSquare },
  { name: "Projects", path: "/admin/projects", icon: FolderKanban },
  { name: "Reports", path: "/admin/reports", icon: Flag },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`hidden lg:flex flex-col glass-strong border-r border-border/50 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary" />
              <span className="font-display text-lg font-bold text-secondary">Admin Panel</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground p-1">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {adminLinks.map((link) => (
            <Link key={link.path} to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? "bg-secondary/15 text-secondary neon-glow-purple"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{link.name}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-border/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-all">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Exit Admin</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
    </div>
  );
}
