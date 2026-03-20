"use client";
import { useCaregiver } from "@/context/CaregiverContext";
import { useNotifications } from "@/context/NotificationContext";
import { useUser } from "@/context/userContext";
import { ArrowDown, ArrowLeftCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

export default function MessagesPage() {
  const { profile, loading } = useCaregiver();
  const { token } = useUser();
  const { markMessagesRead ,socket } = useNotifications();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showDownArrow, setShowDownArrow] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const activeChatRef = useRef(null);
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowDownArrow(false);
    }, 50);
  };
  // Keep activeChat in a ref for socket callbacks
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Initialize socket
  useEffect(() => {
    if (!profile) return;
  if (!socket.current) return;
    const handleMarkMessagesRead = () => {
      markMessagesRead();
    };

    handleMarkMessagesRead();

    socket.current.on("connect", () => {
      console.log("Socket connected:", socket.current.id);
    });

    // Incoming message
    socket.current.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // If chat is open and msg is from other user → mark seen
      if (
        activeChatRef.current &&
        msg.chat === activeChatRef.current._id &&
        msg.sender !== profile.id
      ) {
        socket.current.emit("seen_messages", {
  chatId: activeChatRef.current._id,
  userId: profile.id,
});
        markMessagesRead();
      } else if (msg.sender !== profile.id) {
        // Increment unread count for chats not open
        setChats((prevChats) =>
          prevChats.map((c) =>
            c._id === msg.chat
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
              : c,
          ),
        );
      }

      scrollToBottom();
    });

    // Delivered updates
    socket.current.on("messages_delivered", (chatId) => {
      if (activeChatRef.current?._id === chatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.status === "sent" ? { ...msg, status: "delivered" } : msg,
          ),
        );
      }
    });

    // Seen updates
    socket.current.on("messages_seen", (chatId) => {
      if (activeChatRef.current?._id === chatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.status !== "seen" ? { ...msg, status: "seen" } : msg,
          ),
        );
        // Reset unread count
        setChats((prevChats) =>
          prevChats.map((c) =>
            c._id === chatId ? { ...c, unreadCount: 0 } : c,
          ),
        );
      }
    });

    return () => {
    if (socket.current) {
      socket.current.off("connect");
      socket.current.off("receive_message");
      socket.current.off("messages_delivered");
      socket.current.off("messages_seen");
    }
  };
  }, [profile]);


  useEffect(() => {
  if (!token) return;

  const fetchChats = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/chats/eligible`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  fetchChats();
}, [token]);

  // Open a chat
  const openChat = async (chat) => {
    setActiveChat(chat);
    markMessagesRead();
    socket.current.emit("join_chat", chat._id);

    // mark messages as seen
    socket.current.emit("seen_messages", {
      chatId: chat._id,
      userId: profile.id,
    });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/chats/${chat._id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!text || !activeChat) return;
    markMessagesRead();
    const receiver = activeChat.participants.find(
      (p) => p._id !== profile.id,
    )?._id;
    const msgData = {
      chatId: activeChat._id,
      sender: profile.id,
      receiver,
      text,
    };

    socket.current.emit("send_message", msgData);

    // Optimistic UI
    setText("");
    scrollToBottom();
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    setShowDownArrow(scrollTop + clientHeight < scrollHeight - 50);
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    const isYesterday =
      d.getDate() === now.getDate() - 1 &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday)
      return `Today ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (isYesterday)
      return `Yesterday ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading || !profile) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex w-full min-h-[calc(100vh-11vh)] max-h-[calc(100vh-8vh)] lg:max-h-[calc(100vh-16vh)] bg-gray-100 overflow-hidden">
      <div
        className={`
      ${activeChat ? "hidden lg:flex" : "flex"} 
      flex-col w-full lg:w-1/3 border-r bg-white
    `}
      >
        {/* Fixed Header */}
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-lg text-blue-500 font-semibold text-center md:text-left">
            Chats
          </h2>
          <p className="text-xs text-gray-500 text-center md:text-left">
            Text your accepted or ongoing booking clients here
          </p>
        </div>
        {/* Scrollable List ONLY */}
        <div className="flex-1 overflow-y-auto p-3">
          {chats.length === 0 && (
            <p className="text-gray-400 text-sm">
              {" "}
              Here you can text with your clients whose bookings you have
              accepted or are currently ongoing.{" "}
            </p>
          )}
          {chats.map((c) => {
            const lastMessage = c.lastMessage;
            const displayName = c.participants
              .filter((p) => p._id !== profile.id)
              .map((p) => p.name)
              .join("");
            let timeLabel = "";
            if (lastMessage?.createdAt) {
              const d = new Date(lastMessage.createdAt);
              if (!isNaN(d.getTime())) {
                const now = new Date();
                const todayStr = now.toDateString();

                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const yesterdayStr = yesterday.toDateString();

                const dateStr = d.toDateString();

                if (dateStr === todayStr) timeLabel = "Today";
                else if (dateStr === yesterdayStr) timeLabel = "Yesterday";
                else timeLabel = d.toLocaleDateString();
              }
            }
            return (
              <div
                key={c._id}
                onClick={() => {
                  openChat(c);
                }}
                className={`p-2 rounded cursor-pointer mb-2 transition flex justify-between items-center bg-blue-50 ${activeChat?._id === c._id ? "bg-blue-200" : "hover:bg-gray-100"}`}
              >
                {" "}
                <div>
                  {" "}
                  {displayName}{" "}
                  {c.unreadCount > 0 && (
                    <span className="ml-2 text-xs text-white bg-red-500 px-1 rounded">
                      {" "}
                      {c.unreadCount} unread{" "}
                    </span>
                  )}{" "}
                </div>{" "}
                {lastMessage && (
                  <div className="text-[10px] text-gray-500">{timeLabel}</div>
                )}{" "}
              </div>
            );
          })}
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        className={`
      ${!activeChat ? "hidden lg:flex" : "flex"} 
      flex-col w-full lg:w-2/3 bg-gray-50
    `}
      >
        {!activeChat ? (
          <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
            Select a chat to start messaging
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-3 border-b bg-white flex items-center justify-between gap-3 sticky top-0 z-10">
              <span className="font-medium text-gray-800 ml-12 lg:ml-0">
                {activeChat.participants
                  .filter((p) => p._id !== profile.id)
                  .map((p) => p.name)
                  .join("")}
              </span>
              <button
                className="lg:hidden text-blue-600 text-sm font-medium"
                onClick={() => setActiveChat(null)}
              >
                <ArrowLeftCircle />
              </button>
            </div>

            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
            >
              {messages.map((m) => {
                const isMine = m.sender === profile.id;

                return (
                  <div
                    key={m._id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm
                  ${
                    isMine
                      ? "bg-green-500 text-white rounded-tr-xs"
                      : "bg-white text-gray-800 border rounded-tl-xs"
                  }`}
                    >
                      <div>{m.text}</div>

                      <div className="text-[10px] mt-1 flex justify-end gap-1 opacity-70">
                        <span>{formatTime(m.createdAt)}</span>

                        {isMine && (
                          <>
                            {m.status === "sent" && <span>✓</span>}
                            {m.status === "delivered" && <span>✓✓</span>}
                            {m.status === "seen" && (
                              <span className="text-blue-600">✓✓</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="border-t p-3 bg-white flex gap-2 sticky bottom-0">
              {showDownArrow && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-20 right-10 bg-blue-500 text-white p-2 rounded-full shadow-lg"
                >
                  {" "}
                  <ArrowDown size={15} />{" "}
                </button>
              )}
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button
                onClick={sendMessage}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
