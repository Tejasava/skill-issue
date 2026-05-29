import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/landing/Footer";
import { Search, Filter, ExternalLink, DollarSign, Upload, Loader, X, Heart, Plus, Github, Link2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { apiGet, apiPost, apiDelete } from "../lib/api";
import { useToast } from "../hooks/use-toast";

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  price: number;
  currency: string;
  category: string;
  githubLink?: string;
  liveLink?: string;
  screenshots?: string[];
  seller: {
    _id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  interestedBuyers: string[];
  isAvailable: boolean;
  createdAt: string;
}

interface FormData {
  title: string;
  description: string;
  techStack: string;
  price: number;
  currency: string;
  category: string;
  githubLink: string;
  liveLink: string;
}

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [interestedProjects, setInterestedProjects] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    techStack: "",
    price: 0,
    currency: "INR",
    category: "Other",
    githubLink: "",
    liveLink: "",
  });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response = await apiGet('/projects');
        const data = await response.json();
        if (data.success) {
          setProjects(data.data || []);
          // Load interested projects from localStorage if authenticated
          if (isAuthenticated && user) {
            const saved = localStorage.getItem(`interested-${user._id}`);
            if (saved) {
              setInterestedProjects(new Set(JSON.parse(saved)));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({ title: "Error", description: "Failed to load projects", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, [isAuthenticated, user, toast]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: "Error", description: "Please login to upload", variant: "destructive" });
      return;
    }

    if (!formData.title || !formData.price) {
      toast({ title: "Error", description: "Title and price are required", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);
      const response = await apiPost(
        "/projects",
        {
          ...formData,
          techStack: formData.techStack.split(",").map(t => t.trim()).filter(t => t),
          price: Number(formData.price),
        },
        token
      );
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Project uploaded successfully" });
        setProjects([data.data, ...projects]);
        setFormData({
          title: "",
          description: "",
          techStack: "",
          price: 0,
          currency: "INR",
          category: "Other",
          githubLink: "",
          liveLink: "",
        });
        setShowUploadModal(false);
      } else {
        toast({ title: "Error", description: data.message || "Failed to upload", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error uploading:", error);
      toast({ title: "Error", description: "Failed to upload project", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleInterest = async (projectId: string) => {
    if (!token) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" });
      return;
    }

    try {
      const isInterested = interestedProjects.has(projectId);
      const endpoint = `/projects/${projectId}/interest`;

      const response = isInterested
        ? await apiDelete(endpoint, token)
        : await apiPost(endpoint, {}, token);

      const data = await response.json();

      if (data.success) {
        const newInterested = new Set(interestedProjects);
        if (isInterested) {
          newInterested.delete(projectId);
        } else {
          newInterested.add(projectId);
        }
        setInterestedProjects(newInterested);
        if (user) {
          localStorage.setItem(`interested-${user._id}`, JSON.stringify(Array.from(newInterested)));
        }
        toast({
          title: "Success",
          description: isInterested ? "Interest removed" : "Interest expressed",
        });
        // Update project in list
        const updatedProject = data.data;
        setProjects(projects.map(p => p._id === projectId ? updatedProject : p));
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to update interest", variant: "destructive" });
    }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.techStack.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">
                Buy & Sell <span className="gradient-text">Developer Projects</span>
              </h1>
              <p className="text-muted-foreground">Find ready-made solutions or monetize your side projects.</p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-glow px-5 py-2.5 rounded-xl text-primary-foreground font-bold text-sm flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Upload Project
              </button>
            )}
          </motion.div>

          <div className="flex items-center gap-4 mb-8 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
              />
            </div>
            <button className="p-3 rounded-xl glass text-muted-foreground hover:text-foreground">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No projects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl overflow-hidden card-hover flex flex-col h-full cursor-pointer group"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                    <span className="font-display text-lg font-bold text-foreground/30 text-center px-4">{project.category}</span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="font-semibold flex-1 group-hover:text-primary transition-colors">{project.title}</h3>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-bold whitespace-nowrap">
                        <DollarSign className="w-3 h-3" />
                        {project.price} {project.currency}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.techStack.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mb-4">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg glass hover:bg-white/10 transition-all"
                          title="View GitHub"
                        >
                          <Github className="w-3 h-3" />
                        </a>
                      )}
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg glass hover:bg-white/10 transition-all"
                          title="View Live Demo"
                        >
                          <Link2 className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {project.seller.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-muted-foreground">{project.seller.name}</span>
                      </div>
                      {isAuthenticated && (
                        <button
                          onClick={() => handleInterest(project._id)}
                          className={`p-2 rounded-lg transition-all ${
                            interestedProjects.has(project._id)
                              ? "bg-accent/20 text-accent"
                              : "glass text-muted-foreground hover:text-accent"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${interestedProjects.has(project._id) ? "fill-current" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upload Project</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g., React Dashboard"
                  className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-foreground placeholder:text-muted-foreground bg-transparent"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-foreground placeholder:text-muted-foreground bg-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-foreground placeholder:text-muted-foreground bg-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-foreground bg-transparent"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-foreground bg-transparent"
                >
                  <option value="Template">Template</option>
                  <option value="Component">Component</option>
                  <option value="Tool">Tool</option>
                  <option value="Framework">Framework</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                  className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-foreground placeholder:text-muted-foreground bg-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">GitHub Link</label>
                <input
                  type="url"
                  value={formData.githubLink}
                  onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-foreground placeholder:text-muted-foreground bg-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Live Link</label>
                <input
                  type="url"
                  value={formData.liveLink}
                  onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-foreground placeholder:text-muted-foreground bg-transparent"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl glass border border-white/10 text-foreground font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 rounded-xl btn-glow text-primary-foreground font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProjectsPage;
