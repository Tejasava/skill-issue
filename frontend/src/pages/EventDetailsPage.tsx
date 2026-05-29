import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "../components/DashboardLayout";
import { Loader, Trophy, Users, Clock, DollarSign, X, AlertCircle, ArrowLeft } from "lucide-react";
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

const EventDetailsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [answers, setAnswers] = useState<FormAnswer>({});
  const [links, setLinks] = useState({
    repositoryLink: "",
    deployedLink: "",
    googleDriveLink: "",
    pptLink: "",
  });

  useEffect(() => {
    const loadEvent = async () => {
      try {
        if (!eventId) {
          setError("Event ID not found");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5001/api/events/${eventId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          setEvent(data.data);
          
          // Check if user has already joined
          if (token && user?._id) {
            const checkRes = await fetch(
              `http://localhost:5001/api/events/${eventId}/check?userId=${user._id}`,
              {
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const checkData = await checkRes.json();
            if (checkData.success) {
              setHasJoined(checkData.data.hasSubmitted);
            }
          }
        } else {
          setError(data.message || "Failed to load event");
        }
      } catch (err) {
        setError("Failed to fetch event details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, token, user?._id]);

  const handleApplyEvent = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!event) return;

    // Validate required fields
    if (event.formQuestions && event.formQuestions.length > 0) {
      for (const question of event.formQuestions) {
        if (question.required && !answers[question.question]) {
          alert(`Please answer: ${question.question}`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `http://localhost:5001/api/events/${event._id}/submit`,
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
        setHasJoined(true);
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

  if (error || !event) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-secondary hover:text-secondary/80 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive text-lg">{error || "Event not found"}</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const isFull = event.currentParticipants >= event.maxParticipants;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondary hover:text-secondary/80 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 border border-border/50"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="font-display text-3xl font-bold mb-2">{event.title}</h1>
                <p className="text-muted-foreground text-lg">{event.description}</p>
              </div>
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0 ${getFormatColor(event.format)}`}>
                {event.format}
              </span>
            </div>

            {isFull && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-destructive/10 border border-destructive/50 text-destructive p-4 rounded-lg mb-4 flex gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>Event is full - no slots available</div>
              </motion.div>
            )}

            {hasJoined && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-accent/10 border border-accent/50 text-accent p-4 rounded-lg mb-4 flex gap-2"
              >
                <Trophy className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>You have already joined this event</div>
              </motion.div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-border/50">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Price</p>
              <p className="font-display text-xl font-bold text-accent">₹{event.price}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Participants</p>
              <p className="font-display text-xl font-bold">
                {event.currentParticipants}/{event.maxParticipants}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Duration</p>
              <p className="font-display text-xl font-bold">{event.duration}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Questions</p>
              <p className="font-display text-xl font-bold">{event.formQuestions ? event.formQuestions.length : 0}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border/50">
            <div>
              <p className="text-muted-foreground text-sm mb-2">Start Date</p>
              <p className="font-semibold">{new Date(event.startDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">End Date</p>
              <p className="font-semibold">{new Date(event.endDate).toLocaleString()}</p>
            </div>
          </div>
          {/* Questions */}
          {event.formQuestions && event.formQuestions.length > 0 && (
            <div className="mb-6 pb-6 border-b border-border/50">
              <h3 className="font-display text-lg font-bold mb-4">Event Questions</h3>
              <div className="space-y-3">
                {event.formQuestions.map((q, idx) => (
                  <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-semibold text-sm mb-1">
                      {idx + 1}. {q.question} {q.required && <span className="text-destructive">*</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{q.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg font-semibold transition-all"
            >
              Close
            </button>
            {!hasJoined && !isFull && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-black px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Apply Now
              </button>
            )}
          </div>
        </motion.div>

        {/* Apply Modal */}
        {showApplyModal && (
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
                <h2 className="font-display text-2xl font-bold">Apply for Event</h2>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Form Questions */}
                {event.formQuestions && event.formQuestions.length > 0 && event.formQuestions.map((question, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-semibold mb-2">
                      {question.question} {question.required && <span className="text-destructive">*</span>}
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

                {/* Link Fields */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Repository Link</label>
                  <input
                    type="url"
                    value={links.repositoryLink}
                    onChange={(e) => setLinks({ ...links, repositoryLink: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Deployed Link</label>
                  <input
                    type="url"
                    value={links.deployedLink}
                    onChange={(e) => setLinks({ ...links, deployedLink: e.target.value })}
                    placeholder="https://example.com"
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
                  <label className="block text-sm font-semibold mb-2">PPT Link</label>
                  <input
                    type="url"
                    value={links.pptLink}
                    onChange={(e) => setLinks({ ...links, pptLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyEvent}
                  disabled={submitting}
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-black px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventDetailsPage;
