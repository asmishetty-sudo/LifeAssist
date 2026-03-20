"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Bell,
  DollarSign,
  Star,
  MessageSquare,
  Calendar,
  User,
  Settings,
  Menu,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { useEffect, useRef, useState } from "react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/caregiver",
  },
  {
    name: "Bookings",
    icon: CalendarDays,
    path: "/caregiver/bookings",
  },
  {
    name: "Requests",
    icon: Bell,
    path: "/caregiver/requests",
  },
  {
    name: "Earnings",
    icon: DollarSign,
    path: "/caregiver/earnings",
  },
  {
    name: "Feedback",
    icon: Star,
    path: "/caregiver/feedback",
  },
  {
    name: "Messages",
    icon: MessageSquare,
    path: "/caregiver/messages",
  },
  {
    name: "Availability",
    icon: Calendar,
    path: "/caregiver/availability",
  },
  {
    name: "Profile",
    icon: User,
    path: "/caregiver/profile",
  },
  {
    name: "Help / Settings",
    icon: Settings,
    path: "/caregiver/settings",
  },
];

export default function CaregiverNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef();
  const {
    messageUnread,
    bookingUnread,
    feedbackUnread,
    statusUnread,
    markMessagesRead,
    markBookingsRead,
    markFeedbackRead,
    markStatusRead,
  } = useNotifications();
  
  useEffect(() => {
    function handleClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-lg shadow"
        onClick={() => setOpen(true)}
      >
        <Menu size={22} />
      </button>
      <aside
        ref={navRef}
        className={`fixed top-16 left-0 z-60 w-64 h-[calc(100vh-4rem)] 
        bg-gradient-to-b from-green-50 via-blue-50 to-white border-r border-green-100 
        p-4 shadow-sm transition-transform duration-300
        
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:flex md:flex-col`}
      >
        <h2 className="text-xl font-bold mb-6 text-center text-green-700">
          Caregiver Panel
        </h2>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              {/* Parent Item */}
              <Link
                href={item.path}
                onClick={() => {
                  setOpen(false);
                  if (item.path === "/caregiver/messages") markMessagesRead();
                  if (item.path === "/caregiver/requests") markBookingsRead();
                  if (item.path === "/caregiver/feedback") markFeedbackRead();
                  if (item.path === "/caregiver/bookings") markStatusRead();
                }}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-green-100 hover:text-green-800 ${
                  pathname === item.path
                    ? "bg-green-200 text-green-900 font-semibold"
                    : "text-gray-700"
                }`}
              >
                <item.icon size={18} />
                <span className="flex-1">{item.name}</span>

                {/* Red dot notifications */}
                {item.path === "/caregiver/messages" &&
                  messageUnread > 0 && (
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                {item.path === "/caregiver/requests" &&
                  bookingUnread > 0 && (
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                {item.path === "/caregiver/feedback" &&
                  feedbackUnread > 0 && (
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                {item.path === "/caregiver/bookings" &&
                  statusUnread > 0 && (
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
              </Link>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
