"use client";

import { useMemo } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import { Calendar, CreditCard, Star } from "lucide-react";
import Image from "next/image";

export default function AdminDashboard() {
  const {
    caregivers,
    users,
    patients,
    bookings,
    feedbacks,
    complaints,
    services,
  } = useAdmin();

  // 🔹 CORE COUNTS
  const totalUsers = users.length;
  const totalCaregivers = caregivers.length;
  const verifiedCaregivers = caregivers.filter((c) => c.verified).length;
  const totalPatients = patients.length;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) =>
    ["accepted", "ongoing"].includes(b.status),
  ).length;

  const pendingComplaints = complaints.filter(
    (c) => c.status === "pending",
  ).length;

  const suspendedUsers = users.filter((u) => u.isSuspended).length;

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((acc, b) => acc + (b.finalAmount || b.estimatedAmount), 0);

  const avgRating =
    caregivers.reduce((acc, c) => acc + (c.rating || 0), 0) /
    (caregivers.length || 1);

  // 🔹 BOOKING STATUS PIE
  const bookingStatusData = {
    labels: [
      "Pending",
      "Accepted",
      "Rejected",
      "Ongoing",
      "Completed",
      "Cancelled",
    ],
    datasets: [
      {
        data: [
          bookings.filter((b) => b.status === "pending").length,
          bookings.filter((b) => b.status === "accepted").length,
          bookings.filter((b) => b.status === "rejected").length,
          bookings.filter((b) => b.status === "ongoing").length,
          bookings.filter((b) => b.status === "completed").length,
          bookings.filter((b) => b.status === "cancelled").length,
        ],
      },
    ],
  };

  // 🔹 MONTHLY REVENUE
  const monthlyRevenue = useMemo(() => {
    const months = {};

    bookings.forEach((b) => {
      if (b.paymentStatus === "paid") {
        const month = new Date(b.createdAt).toLocaleString("default", {
          month: "short",
        });
        months[month] =
          (months[month] || 0) + (b.finalAmount || b.estimatedAmount);
      }
    });

    return {
      labels: Object.keys(months),
      datasets: [
        {
          label: "Revenue",
          data: Object.values(months),
        },
      ],
    };
  }, [bookings]);

  // 🔹 TOP CAREGIVERS
  const topCaregivers = [...caregivers]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return (
    <div className="sm:p-6 space-y-8">
      <h1 className="text-xl sm:text-3xl text-center md:text-left font-bold text-indigo-600 border-b pb-2 mb-4">
        Admin Dashboard
      </h1>
      {/* 🔥 TOP METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card
          title="Users"
          value={totalUsers}
          gradient="bg-gradient-to-r from-blue-400 to-blue-800"
        />
        <Card
          title="Caregivers"
          value={totalCaregivers}
          gradient="bg-gradient-to-r from-yellow-400 to-yellow-700"
        />
        <Card
          title="Bookings"
          value={totalBookings}
          gradient="bg-gradient-to-r from-purple-400 to-purple-700"
        />
        <Card
          title="Total Earnings"
          value={`₹${totalRevenue}`}
          gradient="bg-gradient-to-r from-green-400 to-green-700"
        />
        <Card
          title="Active Bookings"
          value={activeBookings}
          gradient="bg-gradient-to-r from-pink-400 to-pink-700"
        />
        <Card
          title="Pending Complaints"
          value={pendingComplaints}
          gradient="bg-gradient-to-r from-red-400 to-red-700"
        />
        <Card
          title="Suspended Users"
          value={suspendedUsers}
          gradient="bg-gradient-to-r from-gray-400 to-gray-700"
        />
        <Card
          title="Avg Rating"
          value={avgRating.toFixed(2)}
          gradient="bg-gradient-to-r from-indigo-400 to-indigo-700"
        />
      </div>

      {/* 📊 Charts */}
      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-300 p-5 rounded-xl shadow">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-indigo-600" size={24} />
            <h2 className="text-xl md:text-2xl font-bold text-gray-600">
              Booking Status
            </h2>
          </div>
          <Pie data={bookingStatusData} />
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-300 p-5 rounded-xl shadow">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="text-green-600" size={24} />
            <h2 className="text-xl md:text-2xl font-bold text-gray-600">
              Monthly Revenue
            </h2>
          </div>
          <Line data={monthlyRevenue} />
        </div>
      </div>

      {/* ⭐ Top Caregivers */}
      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
        {/* Heading with icon */}
        <div className="flex items-center gap-2 mb-5">
          <Star className="text-yellow-500" size={24} />
          <h2 className="text-xl font-bold text-gray-800">
            Top Rated Caregivers
          </h2>
        </div>

        {/* Caregivers list */}
        <div className="space-y-3">
          {topCaregivers.map((c) => (
            <div
              key={c._id}
              className="flex justify-between items-center p-3 border rounded-lg hover:bg-yellow-50 transition"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={
                    c.photo
                      ? `${process.env.NEXT_PUBLIC_BACKEND}/${c.photo}`
                      : "/default-avatar.png"
                  }
                  alt={c.fullName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover border"
                />
                <span className="font-medium text-gray-700">{c.fullName}</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                <Star size={16} />
                <span>{c.rating?.toFixed(1) || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, gradient }) {
  return (
    <div
      className={`p-4 rounded-xl shadow hover:shadow-lg transition text-white ${gradient}`}
    >
      <p className="text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}
