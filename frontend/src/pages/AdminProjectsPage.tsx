import { motion } from "framer-motion";
import { AdminLayout } from "../components/AdminLayout";
import { useState, useEffect } from "react";
import { Eye, Trash2, Loader, ExternalLink } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  techStack?: string[];
  githubLink?: string;
  liveLink?: string;
  seller?: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
  };
  isAvailable: boolean;
  createdAt: string;
}

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-low" | "price-high">("newest");
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/admin/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data);
      } else {
        throw new Error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projectTitle}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/admin/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project deleted successfully",
        });
        await fetchProjects();
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const getFilteredAndSortedProjects = () => {
    const filtered = projects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.seller?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case "oldest":
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "price-low":
        return filtered.sort((a, b) => a.price - b.price);
      case "price-high":
        return filtered.sort((a, b) => b.price - a.price);
      case "newest":
      default:
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  const filteredProjects = getFilteredAndSortedProjects();

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">
                Manage <span className="text-secondary">Projects</span>
              </h1>
              <p className="text-muted-foreground">View and manage all projects on the platform</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-secondary">{projects.length}</div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-8 flex-wrap">
            <input
              type="text"
              placeholder="Search by title, description, or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[250px] px-4 py-2 rounded-lg glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "price-low" | "price-high")}
              className="px-4 py-2 rounded-lg glass text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Content */}
          {loading ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Eye className="w-8 h-8 opacity-50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {projects.length === 0 ? "No projects available" : "No projects match your search"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {project.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{project.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {project.seller?.name || "Unknown"} • {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-foreground line-clamp-2">{project.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {project.category}
                        </span>
                        {project.techStack?.slice(0, 3).map((tech) => (
                          <span key={tech} className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary">
                            {tech}
                          </span>
                        ))}
                        {project.techStack && project.techStack.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                            +{project.techStack.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="font-semibold text-foreground">
                          {project.currency} {project.price.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.isAvailable
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {project.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                            GitHub
                          </a>
                        )}
                        {project.liveLink && (
                          <a
                            href={project.liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Delete Action */}
                    <button
                      onClick={() => handleDelete(project._id, project.title)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all flex-shrink-0"
                      title="Delete Project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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

export default AdminProjectsPage;

