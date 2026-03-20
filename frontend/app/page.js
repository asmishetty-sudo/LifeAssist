"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/context/userContext";
import {
  Heart,
  Users,
  Calendar,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      router.push(`/${user.userType}`);
    }
  }, [user, router]);

  return (
    <div className=" bg-white rounded-3xl shadow-xl overflow-hidden">
      <section className="grid md:grid-cols-2 items-center px-8 md:px-20 py-10 gap-10 bg-gradient-to-r from-[#f4fbff] to-white">
        {/* LEFT CONTENT */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-800">
            Find <span className="text-blue-900">Trusted Caregivers</span> for
            Your Loved Ones - Instantly.
          </h2>

          <p className="mt-6 text-gray-600 text-lg">
            Whether it&apos;s for an elderly or sick family member, hire the
            right help with{" "}
            <span className="text-blue-900 font-semibold">LifeAssist</span>.
          </p>

          {/* ROLE CARDS */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow hover:shadow-lg transition">
              <Users className="text-blue-900" size={30} />
              <div>
                <h3 className="font-semibold">Family Member</h3>
                <p className="text-sm text-gray-500">Looking to Hire?</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow hover:shadow-lg transition">
              <Heart className="text-blue-500" size={30} />
              <div>
                <h3 className="font-semibold">Caregiver</h3>
                <p className="text-sm text-gray-500">Looking for Work?</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex items-center gap-6">
            <Link
              href="/register"
              className="bg-blue-900 flex gap-3 hover:bg-blue-950 text-white pl-8 pr-4 py-3 rounded-lg font-semibold shadow-lg transition"
            >
              Register Now <ArrowRight />
            </Link>

            <span className="flex items-center gap-2 text-gray-500">
              <ShieldCheck size={18} />
              It&apos;s Free & Secure
            </span>
          </div>
        </div>

        <div className="relative w-full aspect-[3/2]">
          <Image
            src="https://images.unsplash.com/photo-1584515933487-779824d29309"
            alt="Image"
            fill
            className="relative w-full h-full object-cover 
             rounded-[50%_54%_50%_54%/78%_31%_78%_31%] backdrop-blur-3xl"
            style={{
              maskImage:
                "radial-gradient(ellipse at center, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 75%)",
            }}
          />
        </div>
      </section>

      {/* FEATURES ROW */}
      <section className="px-4 md:px-8 py-5 bg-[#f7fbfd]">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-5 rounded-2xl shadow flex flex-col items-center gap-2">
            <Users className="text-blue-900" />
            <h4 className="font-semibold">Browse Caregivers</h4>
            <p className="text-sm text-gray-500">Verified Profiles</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow flex flex-col items-center gap-2">
            <Calendar className="text-blue-500" />
            <h4 className="font-semibold">Book Easily</h4>
            <p className="text-sm text-gray-500">In Few Clicks</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow flex flex-col items-center gap-2">
            <MessageCircle className="text-blue-900" />
            <h4 className="font-semibold">Chat & Hire</h4>
            <p className="text-sm text-gray-500">Securely</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow flex flex-col items-center gap-2">
            <Heart className="text-red-400" />
            <h4 className="font-semibold">24/7 Support</h4>
          </div>
        </div>

        {/* TRUST TEXT */}
        <div className="flex justify-center items-center gap-1.5 mt-10 text-center text-gray-600">
          Trusted by Families &{" "}
          <span className="text-blue-900 font-semibold">Caregivers</span> Across
          the Country{" "}
          <Heart className="text-pink-400  fill-pink-400 w-5 h-5 inline-block" />
        </div>
      </section>
    </div>
  );
}
