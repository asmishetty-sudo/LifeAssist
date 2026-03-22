"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function BookingsPage() {
  const { bookings, users, patients, caregivers, feedbacks } = useAdmin();
  const router = useRouter();
  const [searchId, setSearchId] = useState("");

  const filteredBookings = bookings.filter((b) =>
    b._id.toLowerCase().includes(searchId.toLowerCase()),
  );

  const getUser = (id) => users.find((u) => u._id === id);
  const getCaregiver = (id) => caregivers.find((c) => c._id === id);
  const getPatient = (id) => patients.find((p) => p._id === id);
  const getFeedback = (bookingId) =>
    feedbacks.filter((f) => f.bookingId === bookingId);

  return (
    <div className="sm:p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-xl sm:text-3xl text-center md:text-left font-bold text-indigo-600 border-b pb-2 mb-4">
        All Bookings
      </h1>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Booking ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="w-full md:w-1/3 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {filteredBookings.length === 0 ? (
        <p className="text-gray-400 italic">No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const user = getUser(b.userId);
            const caregiver = getCaregiver(b.caregiverId);
            const patient = getPatient(b.patientId?._id);
            const bFeedback = getFeedback(b._id);

            return (
              <div
                key={b._id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p>
                      <strong>Booking ID:</strong> {b._id.toUpperCase()}
                    </p>
                    <p>
                      <strong>Patient:</strong>{" "}
                      <span
                        className="text-indigo-600 hover:underline cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/patients/${patient?._id}`)
                        }
                      >
                        {patient?.name || "Unknown"}
                      </span>
                    </p>
                    <p>
                      <strong>Family Member:</strong>{" "}
                      <span
                        className="text-indigo-600 hover:underline cursor-pointer"
                        onClick={() =>
                          user && router.push(`/admin/users/family/${user._id}`)
                        }
                      >
                        {user?.name || "Unknown"}
                      </span>
                    </p>
                    <p>
                      <strong>Caregiver:</strong>{" "}
                      <span
                        className="text-indigo-600 hover:underline cursor-pointer"
                        onClick={() =>
                          caregiver &&
                          router.push(
                            `/admin/users/caregiver/${caregiver.userId}`,
                          )
                        }
                      >
                        {caregiver?.fullName || "Unknown"}
                      </span>
                    </p>
                    <p>
                      <strong>Service:</strong> {b.serviceId?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`font-semibold px-2 py-1 rounded-full text-sm ${
                          b.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : b.status === "accepted"
                              ? "bg-blue-100 text-blue-800"
                              : b.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : b.status === "ongoing"
                                  ? "bg-purple-100 text-purple-800"
                                  : b.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : b.status === "cancelled"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </p>
                    <p>
                      <strong>Payment:</strong> {b.paymentStatus.toUpperCase()}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹
                      {b.finalAmount || b.estimatedAmount}
                    </p>
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(b.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Feedback */}
                {bFeedback.length > 0 && (
                  <div className="mt-2 bg-indigo-50 p-3 rounded-lg space-y-1">
                    <h3 className="font-semibold text-indigo-700 flex items-center gap-1">
                      <Star size={16} className="text-yellow-400" /> Feedback
                    </h3>
                    {bFeedback.map((f) => {
                      const fbUser = getUser(b.userId);
                      const fbCaregiver = getCaregiver(f.caregiverId);
                      return (
                        <div
                          key={f._id}
                          className="p-2 border rounded-lg bg-white"
                        >
                          <p>
                            <strong>User:</strong> {fbUser?.name || "Unknown"}
                          </p>
                          <p>
                            <strong>Caregiver:</strong>{" "}
                            {fbCaregiver?.fullName || "Unknown"}
                          </p>
                          <p>
                            <strong>Rating:</strong> {f.rating} ⭐
                          </p>
                          <p>
                            <strong>Message:</strong>{" "}
                            {f.message || "No message"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
