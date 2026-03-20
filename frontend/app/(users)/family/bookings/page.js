"use client";

import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useUser } from "@/context/userContext";
import toast from "react-hot-toast";

export default function MyBookings() {
  const { token } = useUser();
  const { bookings, loading } = useFamily();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [confirmCancel, setConfirmCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const tabs = [
    "all",
    "pending",
    "accepted",
    "ongoing",
    "completed",
    "cancelled",
    "rejected",
    "expired",
  ];

  const cancelBooking = async () => {
    if (!confirmCancel) return;

    setCancelling(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/info/bookings/${confirmCancel._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to cancel booking");
      } else {
        toast.success("Booking cancelled");

        setConfirmCancel(null);
      }
    } catch {
      toast.error("Server error");
    }

    setCancelling(false);
  };
  const now = new Date();

  const bookingCounts = {
    all: bookings.length,
    pending: bookings.filter(
      (b) => b.status === "pending" && new Date(b.expiresAt) > now,
    ).length,
    accepted: bookings.filter((b) => b.status === "accepted").length,
    ongoing: bookings.filter((b) => b.status === "ongoing").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
    expired: bookings.filter(
      (b) => b.status === "pending" && new Date(b.expiresAt) < now,
    ).length,
  };
  const filteredBookings = bookings.filter((b) => {
    const searchMatch =
      b.caregiverId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      b.patientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b._id.toLowerCase().includes(search.toLowerCase());

    let statusMatch = true;

    const isExpired =
      b.status === "pending" && new Date(b.expiresAt) < new Date();

    if (activeTab !== "all") {
      if (activeTab === "expired") {
        statusMatch = isExpired;
      } else if (activeTab === "pending") {
        statusMatch = b.status === "pending" && !isExpired;
      } else {
        statusMatch = b.status === activeTab;
      }
    }

    return searchMatch && statusMatch;
  });

  const getStatusColor = (booking) => {
    if (
      booking.status === "pending" &&
      new Date(booking.expiresAt) < new Date()
    )
      return "bg-gray-400";

    switch (booking.status) {
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "ongoing":
        return "bg-blue-500";
      case "completed":
        return "bg-indigo-500";
      case "cancelled":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
        Loading bookings...
      </div>
    );

  return (
    <div className="p-3 md:p-6 w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">
        My Bookings
      </h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search caregiver, patient, booking ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-4 py-2 w-full mb-4"
      />

      {/* STATUS TABS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}

            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab
                  ? "bg-white text-blue-600"
                  : "bg-gray-400 text-white"
              }`}
            >
              {bookingCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* BOOKINGS */}
      {filteredBookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="p-6 rounded-2xl shadow-md border flex flex-col md:flex-row justify-between gap-4 bg-white hover:shadow-lg"
            >
              {/* LEFT INFO */}
              <div className="space-y-2 flex-1">
                <h2 className="text-lg font-semibold">
                  {booking.serviceId?.name}
                </h2>

                <p>
                  <b>Caregiver:</b> {booking.caregiverId?.fullName || "Unknown"}
                </p>

                <p>
                  <b>Patient:</b> {booking.patientId?.name || "Unknown"}
                </p>

                <p>
                  <b>Start:</b>{" "}
                  {new Date(booking.startDate).toLocaleDateString()}
                </p>

                <p>
                  <b>Slot:</b> {booking.slot.selectedDay.join(", ")} |{" "}
                  {booking.slot.startTime} - {booking.slot.endTime}
                </p>

                <p>
                  <b>Duration:</b> {booking.durationValue}{" "}
                  {booking.durationType}
                </p>

                {booking.notes && (
                  <p>
                    <b>Notes:</b> {booking.notes}
                  </p>
                )}
              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col items-end gap-3">
                <span
                  className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${getStatusColor(
                    booking,
                  )}`}
                >
                  {booking.status === "pending" &&
                  new Date(booking.expiresAt) < new Date()
                    ? "Expired"
                    : booking.status}
                </span>

                <p className="font-semibold">
                  ₹{booking.estimatedAmount.toLocaleString()}
                </p>

                <p className="text-xs text-gray-500">
                  {booking._id.toUpperCase()}
                </p>

                {(booking.status === "accepted" ||
                  booking.status === "ongoing") && (
                  <button
                    onClick={() => setConfirmCancel(booking)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRM CANCEL MODAL */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[350px] text-center">
            <h2 className="text-lg font-semibold mb-3">Cancel Booking?</h2>

            <p className="text-sm text-gray-500 mb-4">
              {confirmCancel._id.toUpperCase()}
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmCancel(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                No
              </button>

              <button
                onClick={cancelBooking}
                disabled={cancelling}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                {cancelling ? "Cancelling..." : "Yes Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
