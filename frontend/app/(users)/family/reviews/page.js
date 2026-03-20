"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useUser } from "@/context/userContext";
import toast from "react-hot-toast";
import FeedbackCard from "@/components/FeedbackCard";

export default function FeedbackPage() {
  const { token, loading } = useUser();
  const { bookings = [], feedbacks = [] } = useFamily();
  const [completedBookings, setCompletedBookings] = useState([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    setCompletedBookings(bookings);
  }, [bookings]);
  // -------------------- Pending Feedback --------------------
  const pendingFeedbacks = completedBookings.filter(
    (b) => b.status === "completed" && !b.feedBack,
  );

  // -------------------- Previous Feedback --------------------
  const [previousFeedbacks, setPreviousFeedbacks] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPreviousFeedbacks = useCallback(async (reset = false, customPage) => {
    if (!token) return;

    const currentPage = reset ? 1 : customPage ?? page;

    setLoadingMore(true);

    try {
      if (reset) {
        setPreviousFeedbacks([]);
        setPage(1);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/feedback?limit=10&page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok && Array.isArray(data.feedbacks)) {
        setPreviousFeedbacks((prev) => {
          const combined = reset
            ? data.feedbacks
            : [...prev, ...data.feedbacks];

          const uniqueMap = new Map();
          combined.forEach((f) => uniqueMap.set(f._id, f));

          return Array.from(uniqueMap.values());
        });
      } else {
        toast.error(data.message || "Failed to fetch previous feedbacks");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching feedbacks");
    } finally {
      setLoadingMore(false);
    }
  },
  [token, page]
);

  useEffect(() => {
  if (!token) return;

  if (!hasFetched.current) {
    fetchPreviousFeedbacks(true); // reset = true
    hasFetched.current = true;
  }
}, [token, fetchPreviousFeedbacks]);

  useEffect(() => {
  if (page > 1) {
    fetchPreviousFeedbacks(false, page);
  }
}, [page, fetchPreviousFeedbacks]);

  // -------------------- Give Feedback --------------------
  const [activeBooking, setActiveBooking] = useState(null);

  if (loading) return <div className="p-6">Loading...</div>;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const removePending = (bookingId) => {
    setCompletedBookings((prev) => prev.filter((b) => b._id !== bookingId));
  };
  return (
    <div className="p-3 sm:p-6 w-full max-w-6xl mx-auto space-y-8">
      <h1 className="text-xl sm:text-3xl font-bold text-blue-700 text-center md:text-left">
        Feedback & Reviews
      </h1>

      {/* -------------------- Pending Feedback -------------------- */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-2xl font-semibold text-indigo-600">
          Pending Feedback
        </h2>
        {pendingFeedbacks.length === 0 ? (
          <p className="text-gray-500">No pending feedbacks.</p>
        ) : (
          pendingFeedbacks.map((b) => (
            <div
              key={b._id}
              className="border rounded-xl p-4 flex justify-between items-center bg-white shadow"
            >
              <div>
                <p className="font-semibold">
                  Service: {b.serviceId?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  Caregiver: {b.caregiverId?.fullName || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  Patient: {b.patientId?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  Completed On: {formatDate(b.endDate)}
                </p>
              </div>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => setActiveBooking(b)}
              >
                Give Feedback
              </button>
            </div>
          ))
        )}
      </section>

      {/* -------------------- Previous Feedback -------------------- */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-2xl font-semibold text-green-600">
          Previous Feedback
        </h2>
        {previousFeedbacks.length === 0 ? (
          <p className="text-gray-500">No feedback submitted yet.</p>
        ) : (
          previousFeedbacks.map((f) => (
            <div
              key={f._id}
              className="border rounded-xl p-4 flex justify-between items-center bg-white shadow"
            >
              <div>
                <p className="font-semibold">
                  Booking ID: {f.bookingId?._id.toUpperCase() || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  Service: {f.bookingId?.serviceId?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  Caregiver: {f.caregiverId?.fullName || "Unknown"}
                </p>

                <p className="text-sm text-gray-500">Rating: {f.rating} / 5</p>
                <p className="text-gray-700">{f.message}</p>
              </div>
              <p className="text-gray-400 text-xs">{formatDate(f.createdAt)}</p>
            </div>
          ))
        )}

        {/* View More */}
        {previousFeedbacks.length > 0 && (
          <div className="flex justify-start mt-4">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "View More"}
            </button>
          </div>
        )}
      </section>

      {/* -------------------- Feedback Card -------------------- */}
      {activeBooking && (
        <FeedbackCard
          booking={activeBooking}
          onClose={() => setActiveBooking(null)}
          token={token}
          init={() => {
            fetchPreviousFeedbacks(true);
          }}
          removePending={removePending}
        />
      )}
    </div>
  );
}
