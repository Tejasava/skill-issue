import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "../components/DashboardLayout";
import { Loader, Trophy, Users, Clock, DollarSign, X, AlertCircle } from "lucide-react";
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
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

interface FormAnswer {
  [key: string]: string;
}

const EventsListPage = () => {
  const { token, user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userJoinStatus, setUserJoinStatus] = useState<{ [key: string]: boolean }>({});
  const [answers, setAnswers] = useState<FormAnswer>({});
  const [links, setLinks] = useState({
    repositoryLink: "",
    deployedLink: "",
    googleDriveLink: "",
    pptLink: "",
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5001/api/events", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          setEvents(data.data || []);
          setError("");
          
          // Check join status for each event
          const checkStatuses = async () => {
            for (const event of data.data) {
              try {
                const checkRes = await fetch(`http://localhost:5001/api/events/${event._id}/check?userId=${user?._id}`, {
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });
                const checkData = await checkRes.json();
                if (checkData.success) {
                  setUserJoinStatus(prev => ({
                    ...prev,
                    [event._id]: checkData.data.hasSubmitted,
                  }));
                }
              } catch (err) {
                console.error("Error checking join status:", err);
              }
            }
          };
          checkStatuses();
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
  }, [token, user?._id]);

  const fetchEvents = async () => {
    try {
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch("http://localhost:5001/api/events", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setEvents(data.data || []);
        setError("");
        
        // Check join status for each event
        const checkStatuses = async () => {
          for (const event of data.data) {
            try {
              const checkRes = await fetch(`http://localhost:5001/api/events/${event._id}/check?userId=${user?._id}`, {
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
              const checkData = await checkRes.json();
              if (checkData.success) {
                setUserJoinStatus(prev => ({
                  ...prev,
                  [event._id]: checkData.data.hasSubmitted,
                }));
              }
            } catch (err) {
              console.error("Error checking join status:", err);
            }
          }
        };
        checkStatuses();
      } else {
        setError(data.message || "Failed to load events");
      }
    } catch (err) {
      setError("Failed to fetch events");
      console.error(err);
    }
  };

  const handleOpenApplyModal = (event: Event) => {
    if (event.currentParticipants >= event.maxParticipants) {
      alert("This event is full");
      return;
    }

    setSelectedEvent(event);
    setAnswers({});
    setLinks({
      repositoryLink: "",
      deployedLink: "",
      googleDriveLink: "",
      pptLink: "",
    });
    setShowApplyModal(true);
  };

  const handleSubmitForm = async () => {
    if (!selectedEvent) return;

    // Validate required fields
    if (selectedEvent.formQuestions && selectedEvent.formQuestions.length > 0) {
      for (const question of selectedEvent.formQuestions) {
        if (question.required && !answers[question.question]) {
          alert(`Please answer: ${question.question}`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `http://localhost:5001/api/events/${selectedEvent._id}/submit`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers,
            repositoryLink: links.repositoryLink,
            deployedLink: links.deployedLink,
            googleDriveLink: links.googleDriveLink,
            pptLink: links.pptLink,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Form submitted successfully!");
        setShowApplyModal(false);
        setUserJoinStatus(prev => ({
          ...prev,
          [selectedEvent._id]: true,
        }));
        await fetchEvents();
      } else {
        alert(data.message || "Failed to submit form");
      }
    } catch (err) {
      alert("Error submitting form");
      console.error(err);
    } finally {
      setSubmitting(false);
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-secondary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Explore <span className="text-secondary">Events</span>
            </h1>
            <p className="text-muted-foreground">Participate in exciting events and showcase your skills</p>
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

          {/* Events Grid */}
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-12 text-center"
            >
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No active events at the moment</p>
              <p className="text-muted-foreground/70 text-sm mt-2">Check back soon for exciting opportunities!</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {events.map((event) => {
                const isFull = event.currentParticipants >= event.maxParticipants;
                const hasJoined = userJoinStatus[event._id];

                return (
                  <motion.div
                    key={event._id}
                    whileHover={{ scale: 1.02 }}
                    className="glass p-6 rounded-xl border border-border/50 hover:border-secondary/50 transition-all flex flex-col"
                  >
                    {/* Event Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-display text-xl font-bold text-foreground flex-1 pr-2">
                          {event.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${getFormatColor(event.format)}`}>
                          {event.format}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{event.description}</p>
                    </div>

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-secondary" />
                        <div>
                          <p className="text-muted-foreground text-xs">Participants</p>
                          <p className="font-semibold">{event.currentParticipants}/{event.maxParticipants}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-accent" />
                        <div>
                          <p className="text-muted-foreground text-xs">Price</p>
                          <p className="font-semibold">₹{event.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-muted-foreground text-xs">Duration</p>
                          <p className="font-semibold">{event.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <div>
                          <p className="text-muted-foreground text-xs">Questions</p>
                          <p className="font-semibold">{event.formQuestions ? event.formQuestions.length : 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm border-t border-border/50 pt-3">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Start</p>
                        <p className="font-semibold">{new Date(event.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">End</p>
                        <p className="font-semibold">{new Date(event.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Status Alert */}
                    {isFull && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-lg mb-4 text-xs font-semibold"
                      >
                        ⚠️ Event is full - no slots available
                      </motion.div>
                    )}

                    {hasJoined && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-accent/10 border border-accent/50 text-accent p-3 rounded-lg mb-4 text-xs font-semibold"
                      >
                        ✓ You have already joined this event
                      </motion.div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleOpenApplyModal(event)}
                      disabled={isFull || hasJoined || submitting}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mt-auto ${
                        isFull || hasJoined
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          : "bg-secondary hover:bg-secondary/90 text-black"
                      }`}
                    >
                      {hasJoined ? "✓ Joined" : isFull ? "Event Full" : "Apply Now"}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Apply Modal */}
        {showApplyModal && selectedEvent && (
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
                <h2 className="font-display text-2xl font-bold">{selectedEvent.title}</h2>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Event Info */}
                <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">Organized by:</span> {selectedEvent.createdBy && typeof selectedEvent.createdBy === "object" ? selectedEvent.createdBy.name : "Unknown Organizer"}
                  </p>
                </div>

                {/* Form Questions */}
                {selectedEvent.formQuestions && selectedEvent.formQuestions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Event Questions</h3>
                    {selectedEvent.formQuestions.map((question, idx) => (
                      <div key={idx}>
                        <label className="block text-sm font-semibold mb-2">
                          {question.question}
                          {question.required && <span className="text-destructive"> *</span>}
                        </label>
                        {question.type === "textarea" ? (
                          <textarea
                            value={answers[question.question] || ""}
                            onChange={(e) =>
                              setAnswers({ ...answers, [question.question]: e.target.value })
                            }
                            placeholder={question.placeholder}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary h-20 resize-none"
                          />
                        ) : (
                          <input
                            type={question.type === "url" ? "url" : question.type === "email" ? "email" : question.type === "number" ? "number" : "text"}
                            value={answers[question.question] || ""}
                            onChange={(e) =>
                              setAnswers({ ...answers, [question.question]: e.target.value })
                            }
                            placeholder={question.placeholder}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Special Links Section */}
                <div className="space-y-4 border-t border-border/50 pt-4">
                  <h3 className="font-semibold text-lg">Submission Links</h3>
                  <p className="text-sm text-muted-foreground">
                    📎 Share your project links and resources
                  </p>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Repository Link</label>
                    <input
                      type="url"
                      value={links.repositoryLink}
                      onChange={(e) => setLinks({ ...links, repositoryLink: e.target.value })}
                      placeholder="https://github.com/your-repo"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Deployed Link</label>
                    <input
                      type="url"
                      value={links.deployedLink}
                      onChange={(e) => setLinks({ ...links, deployedLink: e.target.value })}
                      placeholder="https://your-deployed-app.com"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Google Drive Link</label>
                    <input
                      type="url"
                      value={links.googleDriveLink}
                      onChange={(e) => setLinks({ ...links, googleDriveLink: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">PPT/Presentation Link</label>
                    <input
                      type="url"
                      value={links.pptLink}
                      onChange={(e) => setLinks({ ...links, pptLink: e.target.value })}
                      placeholder="https://your-presentation-link"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitForm}
                    disabled={submitting}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-black px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventsListPage;
