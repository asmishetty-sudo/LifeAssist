"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useUser } from "@/context/userContext";

const NotificationContext = createContext();


export const NotificationProvider = ({ children }) => {
const socket = useRef(null);

  const { token, user } = useUser();

  const [notifications, setNotifications] = useState([]);

  const [unread, setUnread] = useState(0);
  const [messageUnread, setMessageUnread] = useState(0);
  const [bookingUnread, setBookingUnread] = useState(0);
  const [feedbackUnread, setFeedbackUnread] = useState(0);
  const [statusUnread, setStatusUnread] = useState(0);

  const [openPanel, setOpenPanel] = useState(false);

  const toggleNotifications = () => {
    setOpenPanel(prev => !prev);
  };

  //FETCH NOTIFICATIONS
  const fetchNotifications = async () => {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json() || [];

      setNotifications(data || []);

     const unreadList = Array.isArray(data)? data.filter(n => !n.read): [];

      setUnread(unreadList.length);

      setMessageUnread(
        unreadList.filter(n => n.type === "message").length
      );

      setBookingUnread(
        unreadList.filter(n => n.type === "booking").length
      );

      setFeedbackUnread(
        unreadList.filter(n => n.type === "feedback").length
      );

      setStatusUnread(
        unreadList.filter(n => n.type === "status").length
      );

    };
  useEffect(() => {

    if (!token) return;
    fetchNotifications();

  }, [token]);



  // ---------------- SOCKET REALTIME ----------------
  useEffect(() => {

    if (!user) return;

    socket.current = io(process.env.NEXT_PUBLIC_BACKEND, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  timeout: 5000,
});
socket.current.on("connect", () => {
  socket.current.emit("join_user", user.userId);
});
socket.current.on("connect_error", (err) => {
  console.log("Socket error:", err.message);
});
socket.current.on("notification", (data) => {

      setNotifications(prev => [data, ...prev]);

      setUnread(prev => prev + 1);

      if (data.type === "message") {
        setMessageUnread(prev => prev + 1);
      }

      if (data.type === "booking") {
        setBookingUnread(prev => prev + 1);
      }

      if (data.type === "feedback") {
        setFeedbackUnread(prev => prev + 1);
      }

      if (data.type === "status") {
        setStatusUnread(prev => prev + 1);
      }

    });

    
return () => {
  if (socket.current) {
    socket.current.disconnect();
    socket.current = null; //prevents multiple sockets
  }
  },  [user?.userId]);



  // ---------------- MARK SINGLE NOTIFICATION ----------------
  const markAsRead = async (id) => {

    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/notifications/${id}/read`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setNotifications(prev =>
      prev.map(n =>
        n._id === id ? { ...n, read: true } : n
      )
    );

    setUnread(prev => Math.max(prev - 1, 0));
  };



  // ---------------- MARK ALL MESSAGE NOTIFICATIONS ----------------
  const markMessagesRead = async () => {
    const ids = notifications
      .filter(n => !n.read && n.type === "message")
      .map(n => n._id);

    await Promise.all(
      ids.map(id =>
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/notifications/${id}/read`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      )
    );

    setNotifications(prev =>
      prev.map(n =>
        n.type === "message" ? { ...n, read: true } : n
      )
    );

    setUnread(prev => prev - messageUnread);
    setMessageUnread(0);
  };



  // ---------------- MARK BOOKING NOTIFICATIONS ----------------
  const markBookingsRead = async () => {

    const ids = notifications
      .filter(n => !n.read && n.type === "booking")
      .map(n => n._id);

    await Promise.all(
      ids.map(id =>
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/notifications/${id}/read`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      )
    );

    setNotifications(prev =>
      prev.map(n =>
        n.type === "booking" ? { ...n, read: true } : n
      )
    );

    setUnread(prev => prev - bookingUnread);
    setBookingUnread(0);
  };



  // ---------------- MARK FEEDBACK NOTIFICATIONS ----------------
  const markFeedbackRead = async () => {

    const ids = notifications
      .filter(n => !n.read && n.type === "feedback")
      .map(n => n._id);

    await Promise.all(
      ids.map(id =>
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/notifications/${id}/read`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      )
    );

    setNotifications(prev =>
      prev.map(n =>
        n.type === "feedback" ? { ...n, read: true } : n
      )
    );

    setUnread(prev => prev - feedbackUnread);
    setFeedbackUnread(0);
  };



  // ---------------- MARK STATUS NOTIFICATIONS ----------------
  const markStatusRead = async () => {

    const ids = notifications
      .filter(n => !n.read && n.type === "status")
      .map(n => n._id);

    await Promise.all(
      ids.map(id =>
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/notifications/${id}/read`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      )
    );

    setNotifications(prev =>
      prev.map(n =>
        n.type === "status" ? { ...n, read: true } : n
      )
    );

    setUnread(prev => prev - statusUnread);
    setStatusUnread(0);
  };



  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unread,
        socket,
        messageUnread,
        bookingUnread,
        feedbackUnread,
        statusUnread,
        openPanel,
        toggleNotifications,
        markAsRead,
        markMessagesRead,
        markBookingsRead,
        markFeedbackRead,
        markStatusRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
