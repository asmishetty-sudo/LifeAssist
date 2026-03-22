"use client";

import { useCaregiver } from "@/context/CaregiverContext";
import { useRef } from "react";

import {
  CheckCircle,
  ThumbsUp,
  Clock,
  Hourglass,
  XCircle,
  MinusCircle,
} from "lucide-react";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";
import Image from "next/image";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

export default function CaregiverDashboard() {
  const { profile, bookings = [], feedbacks = [] } = useCaregiver();

  const earningsChartRef = useRef();

  if (!profile) return null;

  if (profile.status !== "approved" || !profile.verified) {
    return (
      <div className="p-16 text-center">
        <h2 className="text-2xl font-bold text-blue-700">
          Profile Not Yet Active
        </h2>
        <p className="text-gray-600 mt-3">
          Your caregiver profile will appear once verification is complete.
        </p>
      </div>
    );
  }

  /* -------------------- BASIC STATS -------------------- */

  const totalBookings = bookings.length;

  const completed = bookings.filter((b) => b.status === "completed").length;
  const rejected = bookings.filter((b) => b.status === "rejected").length;
  const accepted = bookings.filter((b) => b.status === "accepted").length;
  const ongoing = bookings.filter((b) => b.status === "ongoing").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  const totalEarnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.finalAmount || 0), 0);

  const avgRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        ).toFixed(1)
      : 0;

  const positivePercent =
    feedbacks.length > 0
      ? Math.round(
          (feedbacks.filter((f) => f.rating >= 4).length / feedbacks.length) *
            100,
        )
      : 0;

  /* -------------------- BOOKING STATUS PIE -------------------- */

  const bookingStatusData = {
    labels: ["Completed", "Pending", "Ongoing", "Cancelled"],
    datasets: [
      {
        data: [completed,accepted, pending, ongoing, cancelled,rejected],
        backgroundColor: ["#22c55e","#7e22ce", "#eab308", "#3b82f6","#f97316", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  /* -------------------- MONTHLY EARNINGS -------------------- */

  const monthlyData = {};

  bookings.forEach((b) => {
    if (b.status !== "completed") return;

    const month = new Date(b.createdAt).toLocaleString("default", {
      month: "short",
    });

    monthlyData[month] = (monthlyData[month] || 0) + (b.finalAmount || 0);
  });

  const monthsOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const sortedMonths = monthsOrder.filter((m) => monthlyData[m]);

  const earningsChartData = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Earnings",
        data: sortedMonths.map((m) => monthlyData[m]),
        borderRadius: 10,
        barThickness: 42,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );

          gradient.addColorStop(0, "#22c55e");
          gradient.addColorStop(1, "#4ade80");

          return gradient;
        },
      },
    ],
  };

  const earningsOptions = {
    responsive: true,
    maintainAspectRatio: false,

    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },

    plugins: {
      legend: { display: false },

      tooltip: {
        callbacks: {
          label: (ctx) => " ₹" + ctx.raw,
        },
      },
    },

    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#374151", font: { weight: "600" } },
      },

      y: {
        beginAtZero: true,
        grid: { color: "#e5e7eb" },
        ticks: {
          callback: (value) => "₹" + value,
        },
      },
    },
  };

  /* -------------------- RATINGS DISTRIBUTION -------------------- */

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  feedbacks.forEach((f) => {
    ratingCounts[f.rating]++;
  });

  const ratingData = {
    labels: ["1★", "2★", "3★", "4★", "5★"],
    datasets: [
      {
        data: Object.values(ratingCounts),
        borderRadius: 10,
        barThickness: 38,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );

          gradient.addColorStop(0, "#f59e0b");
          gradient.addColorStop(1, "#fbbf24");

          return gradient;
        },
      },
    ],
  };

  const ratingOptions = {
    responsive: true,
    maintainAspectRatio: false,

    animation: {
      duration: 1200,
    },

    plugins: {
      legend: { display: false },
    },

    scales: {
      x: {
        grid: { display: false },
      },

      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: "#e5e7eb" },
      },
    },
  };

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen space-y-8">
      {/* PROFILE HEADER */}
      <div className="bg-white shadow-lg rounded-xl p-6 flex items-center gap-6 border">
        <Image
          src={
            profile?.photo
              ? `${profile.photo}`
              : "/default-avatar.png"
          }
          alt="Profile"
          width={80}
          height={80}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold text-blue-700">{profile.name}</h1>

          <p className="text-gray-600">
            {profile.experienceYears} years experience
          </p>

          <p className="text-gray-600">
            {profile.serviceArea.city}, {profile.serviceArea.state}
          </p>

          <p className="text-yellow-600 font-semibold">
            ⭐ {profile.rating || 0} ({profile.nooffeedback} reviews)
          </p>
        </div>
      </div>
      {/* BOOKING OVERVIEW */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-blue-700">
          📊 Booking Overview
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-gradient-to-r from-blue-300 to-blue-600 text-white p-3 rounded-xl text-center">
            <p className="text-sm">Total</p>
            <h2 className="text-xl font-bold">{totalBookings}</h2>
          </div>

          <div className="bg-gradient-to-r from-green-300 to-green-700 text-white p-3 rounded-xl text-center">
            <p className="text-sm flex justify-center gap-1">
              <CheckCircle size={16} /> Completed
            </p>
            <h2 className="text-xl font-bold">{completed}</h2>
          </div>

          <div className="bg-gradient-to-r from-indigo-300 to-indigo-700 text-white p-3 rounded-xl text-center">
            <p className="text-sm flex justify-center gap-1">
              <ThumbsUp size={16} /> Accepted
            </p>
            <h2 className="text-xl font-bold">{accepted}</h2>
          </div>

          <div className="bg-gradient-to-r from-blue-200 to-blue-500 text-white p-3 rounded-xl text-center">
            <p className="text-sm flex justify-center gap-1">
              <Hourglass size={16} /> Ongoing
            </p>
            <h2 className="text-xl font-bold">{ongoing}</h2>
          </div>

          <div className="bg-gradient-to-r from-yellow-300 to-yellow-600 text-white p-3 rounded-xl text-center">
            <p className="text-sm flex justify-center gap-1">
              <Clock size={16} /> Pending
            </p>
            <h2 className="text-xl font-bold">{pending}</h2>
          </div>

          <div className="bg-gradient-to-r from-red-300 to-red-600 text-white p-3 rounded-xl text-center">
            <p className="text-sm flex justify-center gap-1">
              <XCircle size={16} /> Rejected
            </p>
            <h2 className="text-xl font-bold">{rejected}</h2>
          </div>

          <div className="bg-gradient-to-r from-gray-300 to-gray-600 text-white p-3 rounded-xl text-center">
            <p className="text-sm flex justify-center gap-1">
              <MinusCircle size={16} /> Cancelled
            </p>
            <h2 className="text-xl font-bold">{cancelled}</h2>
          </div>
        </div>
      </div>
      {/* EARNINGS + FEEDBACK */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-green-700 font-semibold">Total Earnings</h3>
          <p className="text-2xl sm:text-4xl font-bold text-green-600 mt-3">
            ₹{totalEarnings}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-yellow-600 font-semibold">Feedback</h3>
          <p className="text-3xl text-yellow-500 font-bold mt-3">
            ⭐ {avgRating}
          </p>
          <p className="text-gray-500">{positivePercent}% positive reviews</p>
        </div>
      </div>
      {/* CHARTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Booking Status */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col">
          <h3 className="font-semibold text-blue-700 text-base sm:text-lg mb-3 sm:mb-4">
            Booking Status
          </h3>

          <div className="relative w-full h-[220px] sm:h-[240px] md:h-[260px] lg:h-[280px]">
            <Pie
              data={bookingStatusData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col">
          <h3 className="font-semibold text-green-700 text-base sm:text-lg mb-3 sm:mb-4">
            Monthly Earnings
          </h3>

          <div className="relative w-full h-[220px] sm:h-[240px] md:h-[260px] lg:h-[280px]">
            <Bar
              ref={earningsChartRef}
              data={earningsChartData}
              options={{ ...earningsOptions, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col">
          <h3 className="font-semibold text-yellow-600 text-base sm:text-lg mb-3 sm:mb-4">
            Rating Distribution
          </h3>

          <div className="relative w-full h-[220px] sm:h-[240px] md:h-[260px] lg:h-[280px]">
            <Bar
              data={ratingData}
              options={{ ...ratingOptions, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
      {/* -------------------- RECENT BOOKINGS -------------------- */}
   <div className="bg-white rounded-xl shadow p-4 sm:p-6">
  <h3 className="text-blue-700 font-semibold text-lg mb-4">
    🧾 Recent Bookings
  </h3>

  {bookings.length === 0 ? (
    <p className="text-gray-500 text-sm">No bookings yet.</p>
  ) : (
    <div className="space-y-3">
      {bookings
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((b) => (
          <div
            key={b._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border rounded-lg p-3 hover:bg-gray-50 transition"
          >
            {/* LEFT */}
            <div className="flex flex-col">
              <p className="font-semibold text-sm sm:text-base">
                {b.serviceId.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {new Date(b.startDate).toLocaleDateString()}
              </p>

              <p className="text-xs text-gray-400">
                {b.durationValue} {b.durationType}
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-start sm:items-end gap-1">
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium
                  ${
                    b.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : b.status === "pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : b.status === "ongoing"
                      ? "bg-blue-100 text-blue-600"
                      : b.status === "cancelled"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-red-100 text-red-600"
                  }`}
              >
                {b.status}
              </span>

              <p className="text-sm font-semibold text-green-600">
                ₹{b.finalAmount || b.estimatedAmount}
              </p>
            </div>
          </div>
        ))}
    </div>
  )}
</div>
    </div>
  );
}

/* -------------------- STAT CARD -------------------- */

function StatCard({ label, value, color }) {
  return (
    <div
      className={`bg-${color}-100 text-${color}-700 p-3 rounded-xl text-center`}
    >
      <p className="text-sm">{label}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}
