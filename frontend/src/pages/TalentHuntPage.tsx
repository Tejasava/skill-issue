import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/landing/Footer";
import { Trophy, Clock, Users, Flame, ChevronRight, Loader } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

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
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

const TalentHuntPage = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [ongoingEvents, setOngoingEvents] = useState<Event[]>([]);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/events", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success && data.data) {
          // Separate ongoing and completed events
          const ongoing = data.data.filter((event: Event) => event.status === 'active');
          const completed = data.data.filter((event: Event) => event.status === 'completed');
          
          setOngoingEvents(ongoing);
          setCompletedEvents(completed);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const handleJoinEvent = (eventId: string) => {
    if (!token) {
      navigate("/login");
      return;
    }
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Flame className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent font-medium">Talent Hunt</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Compete. <span className="gradient-text">Win.</span> Grow.
            </h1>
            <p className="text-muted-foreground text-lg">Join coding challenges, solve real problems, and win bounties.</p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-secondary" />
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-accent" /> Ongoing Events
              </h2>
              {ongoingEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-12 text-center mb-16"
                >
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-lg">No ongoing events at the moment</p>
                  <p className="text-muted-foreground/70 text-sm mt-2">Check back soon for exciting challenges!</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {ongoingEvents.map((event, i) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass rounded-2xl p-6 card-hover"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold">₹{event.price}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {formatTimeLeft(event.endDate)}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-2">{event.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.description || "No description"}</p>
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {event.currentParticipants}/{event.maxParticipants}
                          </span>
                          <span>{Math.round((event.currentParticipants / event.maxParticipants) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinEvent(event._id)}
                        className="w-full btn-glow py-2.5 rounded-xl text-primary-foreground text-sm font-bold flex items-center justify-center gap-1"
                      >
                        Join Event <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <h2 className="font-display text-2xl font-bold mb-6">🏆 Completed Events</h2>
              {completedEvents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-12 text-center"
                >
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-lg">No completed events yet</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedEvents.map((event) => (
                    <div key={event._id} className="glass rounded-2xl p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.description || "Event completed"}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-bold">₹{event.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TalentHuntPage;
