import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { Camera, Edit3, Loader, X, Check, Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { apiGet, apiPut } from "../lib/api";

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  experienceLevel?: string;
  skillsKnown: string[];
  skillsWanted: string[];
  achievements: string[];
  uploadedWork: Record<string, unknown>[];
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    experienceLevel: "Intermediate",
    skillsKnown: [] as string[],
    skillsWanted: [] as string[],
  });
  const [newSkillKnown, setNewSkillKnown] = useState("");
  const [newSkillWanted, setNewSkillWanted] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    // Reset image error state when userData changes
    setImageLoadError(false);
  }, [userData?.avatar]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?._id || !token) {
          setError("Please login to view your profile");
          setLoading(false);
          // Redirect to login after 2 seconds
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        const response = await apiGet(`/users/${user._id}`, token);

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch user data");
          setLoading(false);
          return;
        }

        setUserData(data.data);
        console.log('🖼️ Avatar URL loaded:', data.data.avatar);
        setFormData({
          name: data.data.name || "",
          bio: data.data.bio || "",
          phone: data.data.phone || "",
          experienceLevel: data.data.experienceLevel || "Intermediate",
          skillsKnown: data.data.skillsKnown || [],
          skillsWanted: data.data.skillsWanted || [],
        });
        setError("");
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, token, navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkillKnown = () => {
    if (newSkillKnown.trim() && !formData.skillsKnown.includes(newSkillKnown)) {
      setFormData({
        ...formData,
        skillsKnown: [...formData.skillsKnown, newSkillKnown.trim()],
      });
      setNewSkillKnown("");
    }
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !formData.skillsWanted.includes(newSkillWanted)) {
      setFormData({
        ...formData,
        skillsWanted: [...formData.skillsWanted, newSkillWanted.trim()],
      });
      setNewSkillWanted("");
    }
  };

  const removeSkillKnown = (skill: string) => {
    setFormData({
      ...formData,
      skillsKnown: formData.skillsKnown.filter(s => s !== skill),
    });
  };

  const removeSkillWanted = (skill: string) => {
    setFormData({
      ...formData,
      skillsWanted: formData.skillsWanted.filter(s => s !== skill),
    });
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("experienceLevel", formData.experienceLevel);
      formDataToSend.append("skillsKnown", JSON.stringify(formData.skillsKnown));
      formDataToSend.append("skillsWanted", JSON.stringify(formData.skillsWanted));
      
      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      const response = await apiPut("/users/profile", formDataToSend, token);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update profile");
        return;
      }

      setUserData(data.data);
      setIsEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
      setError("");
    } catch (err) {
      setError("Failed to save profile");
      console.error(err);
    } finally {
      setIsSaving(false);
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

  if (error && !userData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-red-500">{error || "Failed to load profile"}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // If image fails to load, mark it as error so initials show instead
    const img = e.target as HTMLImageElement;
    console.warn('Image failed to load:', img.src);
    console.warn('Image error details:', {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      currentSrc: img.currentSrc,
    });
    setImageLoadError(true);
  };

  if (isEditing) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass rounded-2xl p-8 mb-6">
              <h2 className="font-display text-2xl font-bold mb-6">Edit Profile</h2>
              
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </div>
              )}

              {/* Avatar Upload */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground relative overflow-hidden">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover rounded-2xl" />
                    ) : userData?.avatar && !imageLoadError ? (
                      <img 
                        src={userData.avatar} 
                        alt="Current avatar" 
                        onError={handleImageError} 
                        onLoad={() => setImageLoadError(false)}
                        className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <span className="text-center">{getInitials(formData.name)}</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="flex-1 px-4 py-3 rounded-xl glass text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  placeholder="Your name"
                />
              </div>

              {/* Bio */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent resize-none"
                  placeholder="Tell about yourself"
                  rows={3}
                />
              </div>

              {/* Phone */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Skills Known */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">Skills I Know</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkillKnown}
                    onChange={(e) => setNewSkillKnown(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkillKnown()}
                    placeholder="Add a skill"
                    className="flex-1 px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  />
                  <button
                    onClick={addSkillKnown}
                    className="px-4 py-3 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-all font-medium text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skillsKnown.map(skill => (
                    <div key={skill} className="px-3 py-1 rounded-full text-sm bg-primary/15 text-primary font-medium flex items-center gap-2">
                      {skill}
                      <button onClick={() => removeSkillKnown(skill)} className="hover:text-primary/70">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Wanted */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-2 block">Skills I Want to Learn</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkillWanted()}
                    placeholder="Add a skill"
                    className="flex-1 px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  />
                  <button
                    onClick={addSkillWanted}
                    className="px-4 py-3 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 transition-all font-medium text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skillsWanted.map(skill => (
                    <div key={skill} className="px-3 py-1 rounded-full text-sm bg-accent/15 text-accent font-medium flex items-center gap-2">
                      {skill}
                      <button onClick={() => removeSkillWanted(skill)} className="hover:text-accent/70">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 btn-glow py-3 rounded-xl text-primary-foreground font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setAvatarPreview(null);
                    setAvatarFile(null);
                    setError("");
                  }}
                  className="flex-1 px-4 py-3 rounded-xl glass text-foreground font-bold text-sm hover:bg-muted/50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="glass rounded-2xl p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-primary-foreground font-display overflow-hidden relative">
                {userData?.avatar && !imageLoadError ? (
                  <img 
                    src={userData.avatar} 
                    alt={userData.name} 
                    onError={handleImageError} 
                    onLoad={() => setImageLoadError(false)}
                    className="w-full h-full object-cover" />
                ) : (
                  <span className="text-center">{getInitials(userData?.name || "")}</span>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="font-display text-2xl font-bold">{userData?.name}</h1>
                <p className="text-muted-foreground text-sm mb-1">{userData?.email}</p>
                {userData?.phone && <p className="text-muted-foreground text-sm mb-1">{userData.phone}</p>}
                {userData?.bio && <p className="text-foreground text-sm">{userData.bio}</p>}
                {userData?.experienceLevel && (
                  <p className="text-xs text-primary font-medium mt-1">Level: {userData.experienceLevel}</p>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-outline-glow px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-3">Skills I Know</h3>
              <div className="flex flex-wrap gap-2">
                {userData?.skillsKnown && userData.skillsKnown.length > 0 ? (
                  userData.skillsKnown.map(s => (
                    <span key={s} className="px-3 py-1.5 rounded-full text-sm bg-primary/15 text-primary font-medium">{s}</span>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No skills added yet</p>
                )}
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-3">Want to Learn</h3>
              <div className="flex flex-wrap gap-2">
                {userData?.skillsWanted && userData.skillsWanted.length > 0 ? (
                  userData.skillsWanted.map(s => (
                    <span key={s} className="px-3 py-1.5 rounded-full text-sm bg-accent/15 text-accent font-medium">{s}</span>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No skills wanted yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Achievements */}
          {userData?.achievements && userData.achievements.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4">Achievements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {userData.achievements.map(a => (
                  <div key={a} className="glass rounded-xl p-4 text-center text-sm card-hover">{a}</div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
