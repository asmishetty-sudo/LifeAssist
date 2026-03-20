"use client";

import { useFamily } from "@/context/FamilyContext";
import { CreditCard, Clock, CheckCircle, Activity } from "lucide-react";

export default function PaymentsPage() {
  const { bookings } = useFamily();

  if (!bookings) return null;

  const valid = bookings.filter(
    (b) =>
      b.status === "completed" ||
      b.status === "accepted" ||
      b.status === "ongoing",
  );

  const paid = valid.filter(
    (b) => b.status === "completed" && b.paymentStatus === "paid",
  );

  const unpaid = valid.filter(
    (b) => b.status === "completed" && b.paymentStatus === "unpaid",
  );

  const ongoing = valid.filter(
    (b) => b.status === "accepted" || b.status === "ongoing",
  );

  const totalPaid = paid.reduce(
    (acc, b) => acc + (b.finalAmount || b.estimatedAmount || 0),
    0,
  );

  const totalUnpaid = unpaid.reduce(
    (acc, b) => acc + (b.finalAmount || b.estimatedAmount || 0),
    0,
  );
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="p-2 sm:p-6 min-h-screen w-full bg-gradient-to-br from-blue-50 via-green-50 to-white">
      <h1 className="text-xl sm:text-3xl text-center md:text-left font-bold text-blue-700 mb-8">
        Payments Overview
      </h1>

      {/* Summary Cards */}

      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-2 sm:gap-6 mb-10">
        <div className="bg-white shadow-lg rounded-xl p-2 lg:p-5 border">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CreditCard className="text-blue-600" />
            <h2 className="font-semibold text-gray-700">Total Paid</h2>
          </div>
          <p className="text-lg lg:text-2xl font-bold text-center text-green-600">
            ₹ {totalPaid}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-2 lg:p-5 border">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Clock className="text-orange-500" />
            <h2 className="font-semibold text-gray-700">Pending Payment</h2>
          </div>
          <p className="text-lg lg:text-2xl font-bold text-center text-orange-600">
            ₹ {totalUnpaid}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-2 lg:p-5 border">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CheckCircle className="text-green-600" />
            <h2 className="font-semibold text-gray-700">Completed</h2>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-center text-green-600">
            {paid.length + unpaid.length}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-2 lg:p-5 border">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Activity className="text-blue-600" />
            <h2 className="font-semibold text-gray-700">Active Services</h2>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-center text-blue-600">
            {ongoing.length}
          </p>
        </div>
      </div>

      {/* Pending Payments */}

      <div className="mb-10">
        <h2 className="text-lg sm:text-xl font-semibold text-orange-600 mb-4">
          Pending Payments
        </h2>

        {unpaid.length === 0 ? (
          <p className="text-gray-500">No pending payments.</p>
        ) : (
          <div className="space-y-4">
            {unpaid.map((b) => (
              <div
                key={b._id}
                className="bg-white border shadow rounded-xl p-4 flex justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    Caregiver: {b.caregiverId?.fullName}
                  </p>

                  <p className="text-sm text-gray-600">
                    Patient: {b.patientId?.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    Booking ID: {b._id.toUpperCase()}
                  </p>

                  <p className="text-sm text-gray-500">
                    Ended: {formatDate(b.updatedAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">
                    ₹ {b.finalAmount || b.estimatedAmount}
                  </p>

                  <p className="text-xs text-gray-500">Unpaid</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paid Payments */}

      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">
          Payment History
        </h2>

        {paid.length === 0 ? (
          <p className="text-gray-500">No completed payments.</p>
        ) : (
          <div className="space-y-4">
            {paid.map((b) => (
              <div
                key={b._id}
                className="bg-white border shadow rounded-xl p-4 flex justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    Caregiver: {b.caregiverId?.fullName}
                  </p>

                  <p className="text-sm text-gray-600">
                    Patient: {b.patientId?.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    Booking ID: {b._id.toUpperCase()}
                  </p>

                  <p className="text-sm text-gray-500">
                    Completed: {formatDate(b.updatedAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    ₹ {b.finalAmount || b.estimatedAmount}
                  </p>

                  <p className="text-xs text-gray-500">Paid</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
