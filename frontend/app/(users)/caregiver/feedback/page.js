"use client";

import { useState, useMemo } from "react";
import { useCaregiver } from "@/context/CaregiverContext";
import { Star, Search, MessageCircle, User, Calendar } from "lucide-react";

export default function FeedbackPage() {
  const { feedbacks, loading } = useCaregiver();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  /* -------------------------
     Average Rating
  ------------------------- */

  const avgRating = useMemo(() => {
    if (!feedbacks?.length) return 0;
    const total = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    return (total / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  /* -------------------------
     Rating Breakdown
  ------------------------- */

  const ratingBreakdown = useMemo(() => {
    const breakdown = { 1:0,2:0,3:0,4:0,5:0 };

    feedbacks?.forEach((f) => {
      breakdown[f.rating] += 1;
    });

    return breakdown;
  }, [feedbacks]);

  /* -------------------------
     Filter + Sort Feedback
  ------------------------- */

  const filteredFeedbacks = useMemo(() => {
    let list = [...(feedbacks || [])];

    if (search) {
  const s = search.toLowerCase();

  list = list.filter((f) =>
    f.message?.toLowerCase().includes(s) ||
    f.bookingId?.toString().toLowerCase().includes(s)
  );
}

    if (sort === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (sort === "highest") {
      list.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "lowest") {
      list.sort((a, b) => a.rating - b.rating);
    }

    return list;
  }, [feedbacks, search, sort]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-7rem)] bg-gradient-to-br from-blue-50 via-green-50 to-white">
        <p className="text-gray-500 text-lg">Loading feedback...</p>
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Page Title */}
      <h1 className="sm:text-3xl text-2xl font-bold text-indigo-600 flex items-center gap-2 justify-center md:justify-start">
        <MessageCircle className="text-indigo-500" />
        Caregiver Feedback
      </h1>

      {/* Rating Summary */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Average Rating */}
        <div className="bg-white p-6 rounded-xl shadow border text-center space-y-2">
          <p className="text-gray-500 text-sm">Average Rating</p>

          <div className="flex justify-center items-center gap-2 text-yellow-500 text-4xl font-bold">
            <Star />
            {avgRating}
          </div>

          <p className="text-gray-400 text-sm">
            Based on {feedbacks?.length || 0} reviews
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow border space-y-3">

          <p className="font-semibold text-gray-700">
            Rating Breakdown
          </p>

          {[5,4,3,2,1].map((star) => {

            const count = ratingBreakdown[star];
            const percent =
              feedbacks?.length
                ? (count / feedbacks.length) * 100
                : 0;

            return (
              <div key={star} className="flex items-center gap-3">

                <span className="flex items-center gap-1 w-12 text-sm">
                  {star} <Star size={14} />
                </span>

                <div className="flex-1 bg-gray-200 h-2 rounded">
                  <div
                    className="bg-yellow-400 h-2 rounded"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="text-xs text-gray-500 w-6">
                  {count}
                </span>

              </div>
            );
          })}

        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search by Id or message..."
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sort */}
        <select
          className="border px-3 py-2 rounded-lg"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>

      </div>

      {/* Feedback List */}

      <div className="grid gap-5">

        {filteredFeedbacks.length === 0 && (
          <div className="bg-white p-10 rounded-xl shadow border text-center">
            <p className="text-gray-500">No feedback found</p>
          </div>
        )}

        {filteredFeedbacks.map((fb) => (
          <div
            key={fb._id}
            className="bg-white border rounded-xl shadow p-5 hover:shadow-lg transition space-y-3"
          >

            {/* Header */}
            <div className="flex justify-between items-center">

              <div className="flex items-center gap-2 font-semibold text-gray-700">
                <User size={18} />
                {fb.userId?.name || "Anonymous"}
              </div>

              <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                <Star size={18} />
                {fb.rating}/5
              </div>

            </div>

            {/* Message */}
            <div className="text-gray-600 text-sm">
              {fb.message || "No message provided"}
            </div>

            {/* Footer */}
            <div className="flex justify-between text-xs text-gray-400 border-t pt-2">

              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(fb.createdAt).toLocaleDateString()}
              </span>

              <span className="ml-2 break-all">
                BookingID: {fb.bookingId?.toUpperCase()}
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}