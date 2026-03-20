"use client";

import { useState, useMemo } from "react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminFeedbackPage() {
  const { feedbacks = [], caregivers = [] } = useAdmin();
  const [sortType, setSortType] = useState("newest");

  // 🔎 Get caregiver by id
  const getCaregiver = (id) =>
    caregivers.find((c) => c._id === id);

  // 🔄 Sorting Logic
  const sortedFeedbacks = useMemo(() => {
    const sorted = [...feedbacks];

    switch (sortType) {
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [feedbacks, sortType]);

  return (
    <div className="sm:p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl sm:text-3xl text-center md:text-left font-bold text-indigo-600 border-b pb-2">
        All Feedback
      </h1>

      {/* 🔹 Sort Dropdown */}
      <div className="flex justify-end">
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Most Rated</option>
          <option value="lowest">Least Rated</option>
        </select>
      </div>

      {/* 🔹 Feedback List */}
      {sortedFeedbacks.length === 0 ? (
        <p className="text-gray-400 italic">No feedback available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedFeedbacks.map((fb) => {
            const caregiver = getCaregiver(fb.caregiverId);

            return (
              <div
                key={fb._id}
                className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition"
              >
                {/* Rating */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < fb.rating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <span className="text-xs text-gray-500">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* User */}
                <p className="text-sm text-gray-600 mb-1">
                  <strong>By:</strong> {fb.userId?.name || "Unknown User"}
                </p>

                {/* Caregiver */}
                <p className="text-sm text-gray-600 mb-2">
                  <strong>For:</strong>{" "}
                  {caregiver?.fullName || "Unknown Caregiver"}
                </p>
{/* BookingId */}
                <p className="text-sm text-gray-600 mb-2">
                  <strong>BookingId:</strong>{" "}
                  {fb.bookingId.toUpperCase() || "Unknown Caregiver"}
                </p>
                {/* Message */}
                <p className="text-gray-700 text-sm mt-2">
                  {fb.message || "No message provided."}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}