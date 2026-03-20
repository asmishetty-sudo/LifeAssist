"use client";

import { useCaregiver } from "@/context/CaregiverContext";
import { DollarSign, Clock, CheckCircle, Activity } from "lucide-react";

export default function EarningsPage() {
  const { bookings, loading } = useCaregiver();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-7rem)] bg-gradient-to-br from-blue-50 via-green-50 to-white">
        <p className="text-gray-500 text-lg">Loading earnings...</p>
      </div>
    );
  }

  // only valid bookings for earnings
  const validBookings = bookings.filter((b) =>
    ["accepted", "ongoing", "completed"].includes(b.status)
  );

  const completedPaid = validBookings.filter(
    (b) => b.status === "completed" && b.paymentStatus === "paid"
  );

  const completedUnpaid = validBookings.filter(
    (b) => b.status === "completed" && b.paymentStatus === "unpaid"
  );

  const activeBookings = validBookings.filter(
    (b) => b.status === "accepted" || b.status === "ongoing"
  );

  const totalPaid = completedPaid.reduce(
    (sum, b) => sum + (b.finalAmount || b.estimatedAmount || 0),
    0
  );

  const totalPending = completedUnpaid.reduce(
    (sum, b) => sum + (b.finalAmount || b.estimatedAmount || 0),
    0
  );

  const activeValue = activeBookings.reduce(
    (sum, b) => sum + (b.estimatedAmount || 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 sm:space-y-8">

  <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 text-center md:text-left">
    Earnings Overview
  </h1>

  {/* Summary Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

    {/* Total Paid */}
    <div className="bg-white shadow rounded-xl p-4 sm:p-6 border">
      <div className="flex items-center gap-3 text-green-600">
        <DollarSign />
        <h2 className="font-semibold ">Total Earned</h2>
      </div>

      <p className="text-xl sm:text-2xl font-bold mt-2 break-all">
        ₹{totalPaid.toLocaleString()}
      </p>

      <p className="text-xs sm:text-sm text-gray-500">
        From {completedPaid.length} completed bookings
      </p>
    </div>

    {/* Pending Payments */}
    <div className="bg-white shadow rounded-xl p-4 sm:p-6 border">
      <div className="flex items-center gap-3 text-yellow-600">
        <Clock />
        <h2 className="font-semibold">Pending Payments</h2>
      </div>

      <p className="text-xl sm:text-2xl font-bold mt-2 break-all">
        ₹{totalPending.toLocaleString()}
      </p>

      <p className="text-xs sm:text-sm text-gray-500">
        {completedUnpaid.length} bookings awaiting payment
      </p>
    </div>

    {/* Active Earnings */}
    <div className="bg-white shadow rounded-xl p-4 sm:p-6 border">
      <div className="flex items-center gap-3 text-blue-600">
        <Activity />
        <h2 className="font-semibold">Active Earnings</h2>
      </div>

      <p className="text-xl sm:text-2xl font-bold mt-2 break-all">
        ₹{activeValue.toLocaleString()}
      </p>

      <p className="text-xs sm:text-sm text-gray-500">
        {activeBookings.length} active bookings
      </p>
    </div>

  </div>

  {/* Booking Status Breakdown */}
  <div className="bg-white rounded-xl shadow border p-4 sm:p-6">

    <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
      <CheckCircle size={18} />
      Booking Breakdown
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">

      <div>
        <p className="text-xl sm:text-2xl font-bold text-green-600">
          {completedPaid.length}
        </p>
        <p className="text-gray-500 text-xs sm:text-sm">
          Completed & Paid
        </p>
      </div>

      <div>
        <p className="text-xl sm:text-2xl font-bold text-yellow-600">
          {completedUnpaid.length}
        </p>
        <p className="text-gray-500 text-xs sm:text-sm">
          Completed but Unpaid
        </p>
      </div>

      <div>
        <p className="text-xl sm:text-2xl font-bold text-blue-600">
          {activeBookings.length}
        </p>
        <p className="text-gray-500 text-xs sm:text-sm">
          Active Bookings
        </p>
      </div>

    </div>

  </div>

  {/* Earnings Table */}
  <div className="bg-white rounded-xl shadow border p-4 sm:p-6">

    <h2 className="text-base sm:text-lg font-semibold mb-4 ">
      Booking Earnings
    </h2>

    <div className="overflow-x-auto">

      <table className="lg:min-w-[620px] w-full text-xs sm:text-sm">

        <thead className="border-b text-gray-600">
          <tr>
            <th className="text-left py-2 whitespace-nowrap">Booking</th>
            <th className="text-left py-2 whitespace-nowrap hidden lg:block">Service</th>
            <th className="text-left py-2 whitespace-nowrap">Patient</th>
            <th className="text-left py-2 whitespace-nowrap">Status</th>
            <th className="text-left py-2 whitespace-nowrap">Payment</th>
            <th className="text-left py-2 whitespace-nowrap">Amount</th>
          </tr>
        </thead>

        <tbody>

          {validBookings.map((b) => (
            <tr key={b._id} className="border-b hover:bg-gray-50">

              <td className=" sm:py-2 py-1 break-all">
                <p className="hidden sm:block">{b._id.toUpperCase()}</p>
                <p className="block sm:hidden">..{b._id.toUpperCase().slice(-6)}</p>
              </td>
              <td className="py-1 whitespace-nowrap hidden lg:block">
                {b.serviceId?.name}
              </td>

              <td className="py-1 whitespace-nowrap">
                {b.patientId?.name}
              </td>

              <td className="py-1 capitalize whitespace-nowrap">
                {b.status}
              </td>

              <td className="py-1 capitalize text-center whitespace-nowrap">
                {b.paymentStatus}
              </td>

              <td className="py-1 whitespace-nowrap font-medium">
                ₹{(b.finalAmount || b.estimatedAmount)?.toLocaleString()}
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  </div>

</div>
  );
}