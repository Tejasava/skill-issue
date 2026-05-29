import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "../components/AdminLayout";
import { Loader, Trash2, Trophy, Plus, X, Eye, AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

interface FormQuestion {
  question: string;
  type: 'text' | 'textarea' | 'url' | 'email' | 'number';
  required: boolean;
  placeholder?: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  format: 'online' | 'offline' | 'hybrid';
  maxParticipants: number;
  currentParticipants: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  formQuestions: FormQuestion[];
  submissions: EventSubmission[];
  createdAt: string;
}

interface EventSubmission {
  userId: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  answers?: Map<string, string>;
  repositoryLink?: string;
  deployedLink?: string;
  googleDriveLink?: string;
  pptLink?: string;
  submittedAt?: string;
}

const AdminEventsPage = () => {
  const { token } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    duration: "",
    format: "online" as 'online' | 'offline' | 'hybrid',
    maxParticipants: 10,
    startDate: "",
    endDate: "",
    formQuestions: [] as FormQuestion[],
  });
  const [currentQuestion, setCurrentQuestion] = useState<FormQuestion>({
    question: "",
    type: "text",
    required: true,
    placeholder: "",
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5001/api/events/admin/all", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          setEvents(data.data || []);
          setError("");
        } else {
          setError(data.message || "Failed to load events");
        }
      } catch (err) {
        setError("Failed to fetch events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [token]);

  const fetchEvents = async () => {
    try {
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5001/api/events/admin/all", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setEvents(data.data || []);
        setError("");
      } else {
        setError(data.message || "Failed to load events");
      }
    } catch (err) {
      setError("Failed to fetch events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.maxParticipants || !formData.startDate || !formData.endDate) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/events", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          price: 0,
          duration: "",
          format: "online" as 'online' | 'offline' | 'hybrid',
          maxParticipants: 10,
          startDate: "",
          endDate: "",
          formQuestions: [],
        });
        setFormStep(1);
        await fetchEvents();
      } else {
        alert(data.message || "Failed to create event");
      }
    } catch (err) {
      alert("Error creating event");
      console.error(err);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }

    setFormData({
      ...formData,
      formQuestions: [...formData.formQuestions, { ...currentQuestion }],
    });

    setCurrentQuestion({
      question: "",
      type: "text",
      required: true,
      placeholder: "",
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData({
      ...formData,
      formQuestions: formData.formQuestions.filter((_, i) => i !== index),
    });
  };

  const handlePublishEvent = async (eventId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/events/${eventId}/publish`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchEvents();
      } else {
        alert(data.message || "Failed to publish event");
      }
    } catch (err) {
      alert("Error publishing event");
      console.error(err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      setDeleting(eventId);
      const response = await fetch(`http://localhost:5001/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        await fetchEvents();
      } else {
        alert(data.message || "Failed to delete event");
      }
    } catch (err) {
      alert("Error deleting event");
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent/20 text-accent";
      case "draft":
        return "bg-secondary/20 text-secondary";
      case "completed":
        return "bg-primary/20 text-primary";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case "online":
        return "bg-blue-500/20 text-blue-400";
      case "offline":
        return "bg-green-500/20 text-green-400";
      case "hybrid":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-secondary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-bold">
              Manage <span className="text-secondary">Events</span>
            </h1>
            <button
              onClick={() => {
                setFormStep(1);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-black px-4 py-2 rounded-lg font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-destructive/10 border border-destructive/50 text-destructive p-4 rounded-lg flex gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </motion.div>
          )}

          {/* Events List */}
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-12 text-center"
            >
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No events created yet</p>
              <p className="text-muted-foreground/70 text-sm mt-2">Create your first event to get started</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4"
            >
              {events.map((event) => (
                <motion.div
                  key={event._id}
                  whileHover={{ scale: 1.01 }}
                  className="glass p-6 rounded-xl border border-border/50 hover:border-secondary/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-xl font-bold text-foreground">{event.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{event.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Price</p>
                          <p className="font-semibold text-accent">₹{event.price}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Participants</p>
                          <p className="font-semibold">{event.currentParticipants}/{event.maxParticipants}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Duration</p>
                          <p className="font-semibold">{event.duration}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Format</p>
                          <span className={`px-2 py-1 rounded text-xs font-semibold inline-block ${getFormatColor(event.format)}`}>
                            {event.format}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Start Date</p>
                          <p>{new Date(event.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">End Date</p>
                          <p>{new Date(event.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={async () => {
                          // Fetch fresh event data with submissions
                          try {
                            const response = await fetch(`http://localhost:5001/api/events/admin/${event._id}`, {
                              headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json",
                              },
                            });
                            const data = await response.json();
                            if (data.success) {
                              setSelectedEvent(data.data);
                              setShowDetailsModal(true);
                            }
                          } catch (err) {
                            console.error("Error fetching event details:", err);
                            setSelectedEvent(event);
                            setShowDetailsModal(true);
                          }
                        }}
                        className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {event.status === "draft" && (
                        <button
                          onClick={() => handlePublishEvent(event._id)}
                          className="px-3 py-2 bg-secondary hover:bg-secondary/90 text-black font-semibold rounded-lg transition-all text-sm"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        disabled={deleting === event._id}
                        className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-all disabled:opacity-50"
                        title="Delete Event"
                      >
                        {deleting === event._id ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Create Event Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">Create Event - Step {formStep}</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormStep(1);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {formStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold mb-2">Event Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                      placeholder="Enter event title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary h-20 resize-none"
                      placeholder="Enter event description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Duration</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                        placeholder="e.g., 2 days"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Format</label>
                      <select
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value as 'online' | 'offline' | 'hybrid' })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Max Participants *</label>
                      <input
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Start Date *</label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">End Date *</label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormStep(1);
                      }}
                      className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setFormStep(2)}
                      className="flex-1 bg-secondary hover:bg-secondary/90 text-black px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      Next: Add Questions
                    </button>
                  </div>
                </motion.div>
              )}

              {formStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg mb-4">
                    <p className="text-sm text-primary">
                      📝 Add questions for participants (optional). You can add any number of questions or skip this step.
                    </p>
                  </div>

                  {/* Question List */}
                  {formData.formQuestions.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-semibold text-muted-foreground">Added Questions ({formData.formQuestions.length})</p>
                      {formData.formQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="bg-muted/50 p-3 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{idx + 1}. {q.question}</p>
                            <p className="text-xs text-muted-foreground">{q.type} {q.required ? "• Required" : ""}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-destructive hover:bg-destructive/10 p-2 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Question Form */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Question</label>
                        <input
                          type="text"
                          value={currentQuestion.question}
                          onChange={(e) =>
                            setCurrentQuestion({ ...currentQuestion, question: e.target.value })
                          }
                          className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                          placeholder="e.g., What is your GitHub repository link?"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Type</label>
                          <select
                            value={currentQuestion.type}
                            onChange={(e) =>
                              setCurrentQuestion({
                                ...currentQuestion,
                                type: e.target.value as 'text' | 'textarea' | 'url' | 'email' | 'number',
                              })
                            }
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                          >
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="url">URL</option>
                            <option value="email">Email</option>
                            <option value="number">Number</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Placeholder</label>
                          <input
                            type="text"
                            value={currentQuestion.placeholder}
                            onChange={(e) =>
                              setCurrentQuestion({
                                ...currentQuestion,
                                placeholder: e.target.value,
                              })
                            }
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                            placeholder="Optional hint text"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentQuestion.required}
                          onChange={(e) =>
                            setCurrentQuestion({
                              ...currentQuestion,
                              required: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-semibold">Make this required</span>
                      </label>

                      <button
                        onClick={handleAddQuestion}
                        className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                      >
                        Add Question
                      </button>
                    </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setFormStep(1)}
                      className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateEvent}
                      disabled={!formData.title}
                      className="flex-1 bg-secondary hover:bg-secondary/90 text-black px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Event
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Event Details Modal */}
        {showDetailsModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">{selectedEvent.title}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(selectedEvent.status)}`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Price</p>
                    <p className="font-semibold text-accent">₹{selectedEvent.price}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Format</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold inline-block ${getFormatColor(selectedEvent.format)}`}>
                      {selectedEvent.format}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Participants</p>
                    <p className="font-semibold">{selectedEvent.currentParticipants}/{selectedEvent.maxParticipants}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Start Date</p>
                    <p className="font-semibold">{new Date(selectedEvent.startDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">End Date</p>
                    <p className="font-semibold">{new Date(selectedEvent.endDate).toLocaleString()}</p>
                  </div>
                </div>

                {/* Form Questions */}
                {selectedEvent.formQuestions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Form Questions</h3>
                    <div className="space-y-2">
                      {selectedEvent.formQuestions.map((q, idx) => (
                        <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                          <p className="font-semibold text-sm">{idx + 1}. {q.question}</p>
                          <p className="text-xs text-muted-foreground">{q.type} {q.required ? "• Required" : "• Optional"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submissions */}
                {selectedEvent.submissions && selectedEvent.submissions.length > 0 ? (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Submissions ({selectedEvent.submissions.length})</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedEvent.submissions.map((sub, idx) => (
                        <div key={idx} className="bg-muted/30 p-4 rounded-lg border border-border/50">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-sm">{sub.userName || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{sub.userEmail || "No email"}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "N/A"}</p>
                          </div>
                          <div className="space-y-1 text-xs">
                            {sub.repositoryLink && (
                              <p><span className="font-semibold">Repository:</span> <a href={sub.repositoryLink} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all">{sub.repositoryLink}</a></p>
                            )}
                            {sub.deployedLink && (
                              <p><span className="font-semibold">Deployed:</span> <a href={sub.deployedLink} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all">{sub.deployedLink}</a></p>
                            )}
                            {sub.googleDriveLink && (
                              <p><span className="font-semibold">Google Drive:</span> <a href={sub.googleDriveLink} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all">{sub.googleDriveLink}</a></p>
                            )}
                            {sub.pptLink && (
                              <p><span className="font-semibold">PPT:</span> <a href={sub.pptLink} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline break-all">{sub.pptLink}</a></p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-center">
                    <p className="text-muted-foreground text-sm">No submissions yet</p>
                  </div>
                )}

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full bg-secondary hover:bg-secondary/90 text-black px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEventsPage;
