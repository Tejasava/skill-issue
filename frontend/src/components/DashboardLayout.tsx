import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, User, ArrowRightLeft, FolderKanban,
  Users, Trophy, MessageSquare, UserPlus, Repeat, LogOut, Zap, Menu,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../stores/authStore";

const sidebarLinks = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", path: "/dashboard/profile", icon: User },
  { name: "Skills", path: "/skills", icon: ArrowRightLeft },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Community", path: "/community", icon: Users },
  { name: "Events", path: "/dashboard/events", icon: Trophy },
  { name: "Talent Hunt", path: "/talent-hunt", icon: Trophy },
  { name: "Chat", path: "/dashboard/chat", icon: MessageSquare },
  { name: "Friends", path: "/dashboard/friends", icon: UserPlus },
  { name: "Skill Exchange", path: "/dashboard/exchanges", icon: Repeat },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col glass-strong border-r border-border/50 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold gradient-text">Skill Issue</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground p-1">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? "bg-primary/15 text-primary neon-glow-blue"
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
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50 h-14 flex items-center px-4">
        <button onClick={() => setMobileOpen(true)} className="text-foreground"><Menu className="w-5 h-5" /></button>
        <Link to="/" className="ml-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold gradient-text">Skill Issue</span>
        </Link>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 glass-strong border-r border-border/50 flex flex-col"
            >
              <div className="p-4 border-b border-border/50">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-display text-lg font-bold gradient-text">Skill Issue</span>
                </Link>
              </div>
              <nav className="flex-1 p-2 space-y-1">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-2 border-t border-border/50">
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-all">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 mt-14 lg:mt-0 p-4 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
