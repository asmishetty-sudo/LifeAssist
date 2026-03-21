"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/userContext";
import { useCaregiver } from "@/context/CaregiverContext";
import ConfirmCard from "@/components/ConfirmCard";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";

export default function PendingBookingsPage() {
  const { token } = useUser();
  const { loading, bookings, init, services } = useCaregiver();
  const [loadingId, setLoadingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState("");

  const now = new Date();

  // Pending + not expired
  const pendingBookings = bookings.filter(
    (b) => b.status === "pending" && new Date(b.expiresAt) > now
  );

  // Expired bookings
  const expiredBookings = bookings.filter(
    (b) => b.status === "pending" && new Date(b.expiresAt) <= now
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/info/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success(`Booking ${newStatus}`);
        init();
        setConfirmTarget(null);
        setConfirmAction("");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
      toast.error("Server error. Try again later.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-7rem)] bg-gradient-to-br from-blue-50 via-green-50 to-white">
        <p className="text-gray-500 text-center text-lg">Loading bookings...</p>
      </div>
    );

  if (bookings.length === 0)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-7rem)] bg-gradient-to-br from-blue-50 via-green-50 to-white">
        <p className="text-gray-500 text-center text-lg">No pending bookings</p>
      </div>
    );

  const renderBookingCard = (b, isExpired = false) => {
    const service = services.find((s) => s._id === b.serviceId._id);

    return (
      <div
  key={b._id}
  className={`relative p-4 sm:p-6 rounded-xl shadow border space-y-4 ${
    isExpired
      ? "bg-gray-100 border-red-400 text-gray-500"
      : "bg-white border-gray-200"
  }`}
>
  {/* Expired badge */}
  {isExpired && (
    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
      Expired
    </span>
  )}

  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
    <h2
      className={`font-semibold text-base sm:text-lg sm:pt-0 pt-3 break-all ${
        isExpired ? "text-red-600" : ""
      }`}
    >
      Booking ID: {b._id.toUpperCase()}
    </h2>

    <span className="text-xs sm:text-sm text-gray-500">
      Expires: {formatDate(b.expiresAt)}
    </span>
  </div>

  {/* Service Info */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
    <div className="space-y-1">
      <p><strong>Service:</strong> {service?.name}</p>
      <p><strong>Estimated Amount:</strong> ₹{b.estimatedAmount}</p>
      <p><strong>Duration:</strong> {b.durationValue} {b.durationType}</p>
    </div>

    <div className="space-y-1">
      <p><strong>Start Date:</strong> {formatDate(b.startDate)}</p>
      <p className="break-words"><strong>Days:</strong> {b.slot.selectedDay.join(", ")}</p>
      <p><strong>Time:</strong> {b.slot.startTime} - {b.slot.endTime}</p>
    </div>
  </div>

  {/* Patient Details */}
  <div className="border-t pt-3">
    <h3
      className={`font-semibold mb-2 text-sm sm:text-base ${
        isExpired ? "text-red-600" : "text-indigo-600"
      }`}
    >
      Patient Details
    </h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
      <p><strong>Patient:</strong> {b.patientId?.name}</p>

      {!isExpired && (
        <>
          <p><strong>Age:</strong> {b.patientId?.age}</p>
          <p className="break-words">
            <strong>Medical Needs:</strong> {b.patientId?.medicalNeeds}
          </p>
          <p className="break-words">
            <strong>Allergies:</strong> {b.patientId?.allergies}
          </p>
        </>
      )}

      <p><strong>Booked By:</strong> {b.userId?.name}</p>
      <p className="break-all"><strong>Email:</strong> {b.userId?.email}</p>
    </div>
  </div>

  {/* Notes */}
  {b.notes && (
    <div className="border-t pt-3 text-xs sm:text-sm space-y-1">
      <p className="break-words"><strong>Notes:</strong> {b.notes}</p>

      {!isExpired && (
        <p className="flex gap-1.5 items-center mt-1 flex-wrap">
          <MapPin className="text-blue-700 shrink-0" size={16} />
          <span className="break-words">
            {b.patientId?.address.city}, {b.patientId?.address.state}
          </span>
        </p>
      )}
    </div>
  )}

  {/* Buttons */}
  {!isExpired && (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3">
      <button
        disabled={loadingId === b._id}
        onClick={() => {
          setConfirmTarget(b);
          setConfirmAction("accepted");
        }}
        className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Accept
      </button>

      <button
        disabled={loadingId === b._id}
        onClick={() => {
          setConfirmTarget(b);
          setConfirmAction("rejected");
        }}
        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Decline
      </button>
    </div>
  )}
</div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 text-center md:text-left">Pending Booking Requests</h1>

      {/* Pending Bookings */}
      {pendingBookings.length === 0 && <p className="text-gray-500">No pending bookings.</p>}
      <div className="grid gap-6">
        {pendingBookings.map((b) => renderBookingCard(b))}
      </div>

      {/* Expired Bookings */}
      {expiredBookings.length > 0 && (
        <>
          <h2 className="text-xl sm:text-2xl font-semibold text-red-600 mt-6">Expired Bookings</h2>
          <div className="grid gap-6">
            {expiredBookings.map((b) => renderBookingCard(b, true))}
          </div>
        </>
      )}

      {/* Confirm Card */}
      {confirmTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <ConfirmCard
            message={`Are you sure you want to ${confirmAction.slice(0,-2)} this booking?`}
            onCancel={() => {
              setConfirmTarget(null);
              setConfirmAction("");
            }}
            onConfirm={() => handleStatusChange(confirmTarget._id, confirmAction)}
          />
        </div>
      )}
    </div>
  );
}
