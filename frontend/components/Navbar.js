"use client";

import Image from "next/image";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout, loading } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-blue-900 text-white px-6 py-1.5 h-16 shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Left Side - Logo + Name + Motto */}
        <div className="flex items-center gap-3">
          <Image
            src="/Logo.png"
            alt="LifeAssist Logo"
            width={40}
            height={40}
            className="rounded-full"
          />

          <div className="flex flex-col">
            <div className="text-2xl font-bold text-green-400">LifeAssist</div>
            <div className="hidden md:block text-sm text-blue-200 italic">
              Caring Made Simple
            </div>
          </div>
        </div>

        {/* Right Side - User */}
        <div className="flex gap-3 md:gap-10">
          {/* <div className="flex gap-3">
             <a href="/" className="text-white border-b-2 border-teal-600">
              Home
            </a>
            <a href="/about">About</a>
            <a href="#">How It Works</a>
            <a href="#">Caregivers</a>
            <a href="#">Contact</a>
          </div> */}
          <div>
            {loading ? (
              <span>Loading...</span>
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="font-medium text-green-300 hidden sm:block">{user.name}</span>
               <NotificationBell/> 

                <button
                  onClick={handleLogout}
                  className="bg-green-500 font-bold hover:bg-green-600 text-white px-4 py-1.5 rounded-md text-sm transition duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3 items-center">
              <Link
            href="/login"
            className=" text-white font-medium text-lg hover:bg-white/20 active:bg-white/40 px-3 py-1 rounded-md"
          >
            Login
          </Link>
              <Link
            href="/register"
            className="hidden md:block bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition"
          >
            Register Now
          </Link>
          </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
