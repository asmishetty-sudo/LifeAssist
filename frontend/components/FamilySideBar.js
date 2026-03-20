"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Search,
  CalendarCheck,
  MessageSquare,
  LifeBuoy,
  CreditCard,
  User,
  Star,
  Menu,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { useEffect, useRef, useState } from "react";
// { name: "Pending", icon: Clock, path: "/family/bookings/pending" },
//       { name: "Accepted", icon: CheckCircle, path: "/family/bookings/accepted" },
//       { name: "Rejected", icon: XCircle, path: "/family/bookings/rejected" },
//       { name: "Ongoing", icon: Loader2, path: "/family/bookings/ongoing" },
//       { name: "Completed", icon: ClipboardCheck, path: "/family/bookings/completed" }
// children: [
//       { name: "Add Patient", icon: UserPlus, path: "/family/patients/add" },
//       { name: "View Patients", icon: Users, path: "/family/patients" }
//     ]
export const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/family",
  },
  {
    name: "Manage Patients",
    icon: Users,
    path: "/family/patients",
  },
  {
    name: "Search & Book Caregivers",
    icon: Search,
    path: "/family/caregivers",
  },
  {
    name: "My Bookings",
    icon: CalendarCheck,
    path: "/family/bookings",
  },
  {
    name: "Messages",
    icon: MessageSquare,
    path: "/family/messages",
  },
  {
    name: "Payments",
    icon: CreditCard,
    path: "/family/payments",
  },
  {
    name: "Profile",
    icon: User,
    path: "/family/profile",
  },
  {
    name: "Reviews / Feedback",
    icon: Star,
    path: "/family/reviews",
  },
  {
    name: "Customer Support",
    icon: LifeBuoy,
    path: "/family/support",
  },
];

export default function FamilySideBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
    const navRef = useRef();

  const { messageUnread, feedbackUnread, statusUnread,  markMessagesRead, markFeedbackRead, markStatusRead} =useNotifications();
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
            className={`fixed top-16 left-0 z-60 w-72 h-[calc(100vh-4rem)] 
            bg-gradient-to-b from-green-50 via-blue-50 to-white border-r border-green-100 
            p-4 shadow-sm transition-transform duration-300
            
            ${open ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:flex md:flex-col`}
          >
      <h2 className="text-xl font-bold mb-6 text-center text-green-700">
        User Panel
      </h2>

      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <div key={index}>
            {/* Parent Item */}
            <Link
              href={item.path}
              onClick={() => {
                setOpen(false);
                if (item.path === "/family/messages") markMessagesRead();
                if (item.path === "/family/reviews") markFeedbackRead();
                if (item.path === "/family/bookings") markStatusRead();
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
              {item.path === "/family/messages" && messageUnread > 0 && (
                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
              )}
              {item.path === "/family/reviews" && feedbackUnread > 0 && (
                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
              )}
              {item.path === "/family/bookings" && statusUnread > 0 && (
                <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
              )}
            </Link>
          </div>
        ))}
      </nav>
    </aside>
    </>
  );
}
