import { motion } from "framer-motion";
import { DashboardLayout } from "../components/DashboardLayout";
import { Send, Paperclip, Code, Loader, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface Message {
  _id: string;
  from: string; // "me" or "them"
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  content: string;
  time: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  name: string;
  lastMsg: string;
  time: string;
  online?: boolean;
  participants: Array<{ _id: string; name: string; avatar?: string }>;
  userId?: string;
}

interface Friend {
  _id: string;
  name: string;
  skillsKnown: string[];
  skillsWanted: string[];
  avatar?: string;
}

const ChatPage = () => {
  const { user, token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch friends and conversations
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token || !user) return;

        // Fetch friends
        const friendsResponse = await fetch("http://localhost:5001/api/friends", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          if (friendsData.success) {
            setFriends(friendsData.data || []);
          }
        }

        // Fetch conversations
        const convsResponse = await fetch("http://localhost:5001/api/chat/conversations", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (convsResponse.ok) {
          const convsData = await convsResponse.json();
          if (convsData.success && Array.isArray(convsData.data)) {
            // Enrich conversations with friend details
            interface ConversationData {
              _id: string;
              participants: Array<{ _id: string; name: string; avatar?: string }>;
              lastMessage?: string;
              updatedAt: string;
            }
            const enrichedConvs = await Promise.all(
              convsData.data.map(async (conv: ConversationData) => {
                const otherUser = conv.participants?.find((p: { _id: string }) => p._id !== user?._id);
                return {
                  _id: conv._id,
                  name: otherUser?.name || "Unknown",
                  lastMsg: conv.lastMessage || "No messages",
                  time: new Date(conv.updatedAt).toLocaleDateString(),
                  participants: conv.participants || [],
                  userId: otherUser?._id,
                };
              })
            );
            setConversations(enrichedConvs);

            // Check for direct conversation ID or friend parameter from URL
            const conversationIdParam = searchParams.get("conversationId");
            const friendIdParam = searchParams.get("with");
            
            if (conversationIdParam && !selectedConversationId) {
              setSelectedConversationId(conversationIdParam);
            } else if (friendIdParam && !selectedFriendId) {
              const conv = enrichedConvs.find((c: Conversation) => c.userId === friendIdParam);
              if (conv) {
                setSelectedConversationId(conv._id);
                setSelectedFriendId(friendIdParam);
              }
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, searchParams, selectedFriendId, selectedConversationId]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversationId || !token) return;

      setMessagesLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5001/api/chat/conversations/${selectedConversationId}/messages`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            interface MessageData {
              _id: string;
              sender?: { _id: string; name: string; avatar?: string };
              content: string;
              createdAt: string;
            }
            const formattedMessages = data.data.map((msg: MessageData) => ({
              _id: msg._id,
              from: msg.sender?._id === user?._id ? "me" : "them",
              sender: msg.sender || { _id: "", name: "Unknown" },
              text: msg.content,
              content: msg.content,
              time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              createdAt: msg.createdAt,
            }));
            setMessages(formattedMessages);
          }
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversationId, token, user]);

  // Handle starting chat with a friend
  const handleSelectFriend = async (friendId: string) => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5001/api/chat/conversations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: friendId }),
      });

      const data = await response.json();
      if (data.success) {
        setSelectedConversationId(data.data._id);
        setSelectedFriendId(friendId);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!msg.trim() || !selectedConversationId || !token || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/chat/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: selectedConversationId,
            content: msg,
            messageType: "text",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newMessage: Message = {
            _id: data.data._id,
            from: "me",
            sender: {
              _id: user?._id || "",
              name: user?.name || "You",
              avatar: user?.avatar,
            },
            text: msg,
            content: msg,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            createdAt: new Date().toISOString(),
          };
          setMessages([...messages, newMessage]);
          setMsg("");

          // Update conversation in the list
          setConversations(
            conversations.map((conv) =>
              conv._id === selectedConversationId
                ? { ...conv, lastMsg: msg, time: new Date().toLocaleDateString() }
                : conv
            )
          );
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const selectedConversation = conversations.find(
    (c) => c._id === selectedConversationId
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-4">
        {/* Friends/Conversations list */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 glass rounded-2xl overflow-hidden flex-col hidden md:flex"
        >
          <div className="p-4 border-b border-border/50">
            <h3 className="font-display font-semibold">
              {conversations.length > 0 ? "Chats" : "Friends"}
            </h3>
          </div>
          <div className="flex-1 overflow-auto">
            {conversations.length > 0 ? (
              conversations.map((c) => (
                <button
                  key={c._id}
                  onClick={() => {
                    setSelectedConversationId(c._id);
                    setSelectedFriendId(c.userId || null);
                  }}
                  className={`w-full p-4 flex items-center gap-3 transition-all text-left border-b border-border/30 ${
                    selectedConversationId === c._id
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Select a friend to start chatting
                </p>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {friends.length > 0 ? (
                    friends.map((f) => (
                      <button
                        key={f._id}
                        onClick={() => handleSelectFriend(f._id)}
                        className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted text-left transition-all flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                          {f.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">{f.name}</span>
                        </div>
                        <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No friends yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 glass rounded-2xl flex flex-col overflow-hidden"
        >
          {selectedConversation && selectedConversationId ? (
            <>
              <div className="p-4 border-b border-border/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {selectedConversation.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {selectedConversation.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedConversation.online ? "Online" : "Offline"}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m._id}
                      className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                          m.from === "me"
                            ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-br-sm"
                            : "glass rounded-bl-sm"
                        }`}
                      >
                        <p>{m.text}</p>
                        <span
                          className={`text-xs mt-1 block ${
                            m.from === "me"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {m.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-muted-foreground hover:text-foreground">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground">
                    <Code className="w-5 h-5" />
                  </button>
                  <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 py-2.5 px-4 rounded-xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !msg.trim()}
                    className="p-2.5 rounded-xl btn-glow text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sendingMessage ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">
                  {loading ? "Loading..." : "Select a friend to start chatting"}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
