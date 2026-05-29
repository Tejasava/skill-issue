import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/landing/Footer";
import { ArrowLeft, Loader, Github, Link2, ExternalLink, Heart, Share2, AlertCircle } from "lucide-react";
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

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInterested, setIsInterested] = useState(false);
  const [updatingInterest, setUpdatingInterest] = useState(false);

  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiGet(`/projects/${projectId}`);
        const data = await response.json();
        if (data.success) {
          setProject(data.data);
          // Check if user is interested
          if (isAuthenticated && user && data.data.interestedBuyers.includes(user._id)) {
            setIsInterested(true);
          }
        } else {
          setError(data.message || "Project not found");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetails();
  }, [projectId, isAuthenticated, user]);

  const handleInterest = async () => {
    if (!token) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" });
      return;
    }

    try {
      setUpdatingInterest(true);
      const endpoint = `/projects/${projectId}/interest`;
      const response = isInterested
        ? await apiDelete(endpoint, token)
        : await apiPost(endpoint, {}, token);

      const data = await response.json();

      if (data.success) {
        setIsInterested(!isInterested);
        setProject(data.data);
        toast({
          title: "Success",
          description: isInterested ? "Interest removed" : "Interest expressed",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to update interest", variant: "destructive" });
    } finally {
      setUpdatingInterest(false);
    }
  };

  const handleMessageSeller = async () => {
    if (!token) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" });
      return;
    }

    if (!project) return;

    try {
      const response = await apiPost('/chat/conversations', { userId: project.seller._id }, token);
      const data = await response.json();
      if (data.success) {
        navigate(`/chat?conversationId=${data.data._id}`);
      } else {
        toast({ title: "Error", description: "Failed to start conversation", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to message seller", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-4 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <button
                onClick={() => navigate("/projects")}
                className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </button>
              <div className="glass rounded-2xl p-8 text-center border border-white/10">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500/50" />
                <p className="text-muted-foreground text-lg">{error || "Project not found"}</p>
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Back Button */}
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>

            {/* Header */}
            <div className="glass rounded-2xl p-8 border border-white/10 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-sm bg-primary/20 text-primary font-medium">
                      {project.category}
                    </span>
                    {project.isAvailable ? (
                      <span className="px-3 py-1 rounded-full text-sm bg-accent/20 text-accent font-medium">
                        Available
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-500 font-medium">
                        Not Available
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-4xl font-bold mb-2">{project.title}</h1>
                  <p className="text-muted-foreground text-lg">{project.description}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="text-3xl font-bold text-accent">
                    {project.price} <span className="text-lg text-muted-foreground">{project.currency}</span>
                  </div>
                  {isAuthenticated && (
                    <button
                      onClick={handleInterest}
                      disabled={updatingInterest}
                      className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                        isInterested
                          ? "bg-accent/20 text-accent hover:bg-accent/30"
                          : "glass text-muted-foreground hover:text-accent"
                      } disabled:opacity-50`}
                    >
                      <Heart className={`w-5 h-5 ${isInterested ? "fill-current" : ""}`} />
                      {isInterested ? "Interested" : "Express Interest"}
                    </button>
                  )}
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold text-primary-foreground">
                  {project.seller.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{project.seller.name}</p>
                  <p className="text-sm text-muted-foreground">{project.seller.email}</p>
                </div>
                {isAuthenticated && user?._id !== project.seller._id && (
                  <button 
                    onClick={handleMessageSeller}
                    className="px-4 py-2 rounded-xl btn-outline-glow text-sm font-medium">
                    Message Seller
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold mb-4">About This Project</h2>
                  <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                </div>

                {/* Tech Stack */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold mb-4">Tech Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 rounded-xl bg-primary/20 text-primary font-medium text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xl font-bold mb-4">Resources</h2>
                  <div className="space-y-3">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Github className="w-5 h-5 text-primary group-hover:text-primary/80" />
                          <div>
                            <p className="font-medium">GitHub Repository</p>
                            <p className="text-sm text-muted-foreground">View source code</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      </a>
                    )}

                    {project.liveLink && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Link2 className="w-5 h-5 text-accent group-hover:text-accent/80" />
                          <div>
                            <p className="font-medium">Live Demo</p>
                            <p className="text-sm text-muted-foreground">View deployed project</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      </a>
                    )}

                    {!project.githubLink && !project.liveLink && (
                      <p className="text-muted-foreground text-center py-8">No links provided yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Details Card */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <h3 className="font-bold mb-4">Project Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Price</p>
                      <p className="font-bold text-lg text-accent">
                        {project.price} {project.currency}
                      </p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Category</p>
                      <p className="font-medium">{project.category}</p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Available</p>
                      <p className="font-medium">{project.isAvailable ? "✓ Yes" : "✗ No"}</p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Interested Users</p>
                      <p className="font-medium">{project.interestedBuyers.length} users</p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Posted</p>
                      <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Action Card */}
                {isAuthenticated ? (
                  user?._id === project.seller._id ? (
                    <div className="glass rounded-2xl p-6 border border-white/10">
                      <h3 className="font-bold mb-4">Your Project</h3>
                      <button className="w-full px-4 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 font-medium transition-all mb-3">
                        Edit Project
                      </button>
                      <button className="w-full px-4 py-2 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 font-medium transition-all">
                        Delete Project
                      </button>
                    </div>
                  ) : (
                    <div className="glass rounded-2xl p-6 border border-white/10">
                      <h3 className="font-bold mb-4">Interested Users</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {project.interestedBuyers.length} users have expressed interest in this project
                      </p>
                      <button 
                        onClick={handleMessageSeller}
                        className="w-full px-4 py-2 rounded-xl btn-glow text-primary-foreground font-medium">
                        Message Seller
                      </button>
                    </div>
                  )
                ) : (
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h3 className="font-bold mb-4">Login to Interact</h3>
                    <p className="text-muted-foreground text-sm mb-4">Sign in to express interest or contact the seller</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
