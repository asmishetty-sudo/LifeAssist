"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserRound,
  CalendarCheck,
  MessageSquareWarning,
  Star,
  Briefcase,
  Settings,
  Bell,
  Menu,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    name: "Users",
    icon: Users,
    path: "/admin/users",
  },
  {
    name: "Caregivers",
    icon: UserCheck,
    path: "/admin/caregivers",
  },
  {
    name: "Patients",
    icon: UserRound,
    path: "/admin/patients",
  },
  {
    name: "Bookings",
    icon: CalendarCheck,
    path: "/admin/bookings",
  },
  {
    name: "Complaints",
    icon: MessageSquareWarning,
    path: "/admin/complaints",
  },
  {
    name: "Feedback",
    icon: Star,
    path: "/admin/feedback",
  },
  {
    name: "Services",
    icon: Briefcase,
    path: "/admin/services",
  },
  // {
  //   name: "Notifications",
  //   icon: Bell,
  //   path: "/admin/notifications",
  // },
  // {
  //   name: "Settings",
  //   icon: Settings,
  //   path: "/admin/settings",
  // },
];
 
export default function AdminSideBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
      const navRef = useRef();
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
  <h2 className="text-xl font-bold mb-6 text-center text-green-700">Admin Panel</h2>

      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <div key={index}>
            {/* Parent Item */}
              <Link
                href={item.path}
                onClick={() => {setOpen(false);}}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-green-100 hover:text-green-800 ${
              pathname === item.path
                ? "bg-green-200 text-green-900 font-semibold"
                : "text-gray-700"
            }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
          </div>
        ))}
      </nav>
    </aside>
    </>
  );
}



