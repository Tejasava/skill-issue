import { Link } from "react-router-dom";
import { Zap, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold gradient-text">Skill Issue</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/skills" className="hover:text-foreground transition-colors">Skills</Link>
          <Link to="/projects" className="hover:text-foreground transition-colors">Projects</Link>
          <Link to="/community" className="hover:text-foreground transition-colors">Community</Link>
          <Link to="/talent-hunt" className="hover:text-foreground transition-colors">Talent Hunt</Link>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-5 h-5" /></a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-5 h-5" /></a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 text-center text-xs text-muted-foreground">
        © 2026 Skill Issue. Built with ❤️ by developers, for developers.
      </div>
    </footer>
  );
}
