"use client";

import { useNotifications } from "@/context/NotificationContext";
import { useUser } from "@/context/userContext";
import { Bell,Inbox,Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function NotificationBell() {
  const {
    unread,
    messageUnread,
    notifications,
    markAsRead,
    markMessagesRead
  } = useNotifications();

  const { user } = useUser();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const dropdownRef = useRef();

  const toggle = () => {
    setPinned(prev => !prev);
    setOpen(true);
  };

  const handleRedirect = (link) => {
    router.push(`/${user.userType}${link}`);
    setOpen(false);
    setPinned(false);
  };

  const handleMessagesClick = async () => {
    await markMessagesRead();
    handleRedirect("/messages");
  };

  const handleNotificationClick = async (notification) => {

    if (!notification.read) {
      await markAsRead(notification._id);
    }

    router.push(notification.link);
    setOpen(false);
    setPinned(false);
  };

  // hover open
  const handleMouseEnter = () => {
    setOpen(true);
  };

  // hover leave
  const handleMouseLeave = () => {
    if (!pinned) {
      setOpen(false);
    }
  };

  // outside click close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
        setPinned(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      {/* Bell */}
      <div onClick={toggle}>
        <Bell size={22} fill="yellow" className="text-yellow-200" />

        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1
            bg-red-500 text-white text-xs
            px-1.5 rounded-full"
          >
            {unread}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="
          absolute right-0 mt-3 w-40 sm:w-72
          bg-white text-black shadow-xl rounded-md sm:rounded-xl
          border border-gray-200
          z-50
          "
        >
          <div className="p-2 sm:p-3 border-b font-semibold text-gray-700">
            Notifications
          </div>

          <div className="max-h-72 overflow-y-auto">

            {/* Messages */}
            {messageUnread > 0 && (
              <div
                onClick={handleMessagesClick}
                className="p-2 sm:p-3 hover:bg-gray-100 cursor-pointer border-b flex items-center gap-2 sm:text-base text-sm"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" /> Messages ({messageUnread})
              </div>
            )}

            {/* Other notifications */}
            {notifications
              .filter(n => !n.read && n.type !== "message")
              .slice(0, 5)
              .map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className="
                    p-2 sm:p-3 sm:text-base text-sm border-b text-sm cursor-pointer
                    hover:bg-gray-100
                    bg-blue-50 font-medium
                  "
                >
                  {n.message}
                </div>
              ))}

            {unread <= 0 && (
              <div className="p-2 sm:p-3 text-sm text-gray-500">
                No notifications
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
