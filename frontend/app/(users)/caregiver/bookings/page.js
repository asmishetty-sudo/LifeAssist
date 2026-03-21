"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, ClipboardCheck, XCircle } from "lucide-react";
import { useCaregiver } from "@/context/CaregiverContext";
import { useUser } from "@/context/userContext";
import ConfirmCard from "@/components/ConfirmCard";
import toast from "react-hot-toast";

export default function BookingsPage() {
  const { bookings, loading, init } = useCaregiver();
  const { token } = useUser();
  const [confirmPaid, setConfirmPaid] = useState(null);
  const [activeTab, setActiveTab] = useState("accepted");
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [finalAmount, setFinalAmount] = useState({});
  const [confirmData, setConfirmData] = useState(null);

  const tabs = [
    { name: "accepted", icon: CheckCircle },
    { name: "ongoing", icon: Clock },
    { name: "completed", icon: ClipboardCheck },
    { name: "cancelled", icon: XCircle },
  ];

  useEffect(() => {
    const filtered = bookings.filter((booking) => booking.status === activeTab);
    setFilteredBookings(filtered);
  }, [activeTab, bookings]);

  const updateBooking = async (bookingId, data) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/info/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );

      const result = await res.json();

      if (res.ok) {
        toast.success(`Booking updated to ${data.status}` || "Booking updated successfully");
        init(); // refresh bookings
      } else {
        toast.error(result.message || "Failed to update booking");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Try again later.");
    } finally {
      setConfirmData(null);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 min-h-[calc(100vh-7rem)] bg-gradient-to-br from-blue-50 via-green-50 to-white">
      <h1 className="text-2xl font-bold mb-6 text-green-700 text-center md:text-left">
        My Bookings
      </h1>

      {/* Tabs */}
      <div className="flex justify-around mb-6 border-b gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-2 capitalize ${
              activeTab === tab.name
                ? "border-b-2 border-green-600 text-green-700 font-semibold"
                : "text-gray-500"
            }`}
          >
            <div className="flex justify-center items-center text-xs md:text-base sm:gap-2 gap-0.5">
              <tab.icon className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px]" />
              {tab.name}
            </div>
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="grid gap-4">
        {filteredBookings.length === 0 && (
          <p className="text-gray-500 text-center">No bookings</p>
        )}

        {filteredBookings.map((booking) => (
          <div
            key={booking._id}
            className={`p-5 rounded-2xl shadow-lg border transition hover:shadow-xl
              ${
                booking.status === "cancelled"
                  ? "bg-gray-100 border-gray-300"
                  : "bg-gradient-to-br from-blue-50 via-green-50 to-white border-green-200"
              }`}
          >
            {/* Info */}

            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-lg text-blue-800">
                  {booking.serviceId?.name}
                </p>

                {/* Show full details only for accepted & ongoing */}
                {booking.status === "accepted" ||
                booking.status === "ongoing" ? (
                  <>
                    <p>
                      <b>Patient:</b> {booking.patientId?.name}
                    </p>
                    <p>
                      <b>Age:</b> {booking.patientId?.age}
                    </p>
                    <p>
                      <b>Medical:</b> {booking.patientId?.medicalNeeds}
                    </p>
                    <p>
                      <b>Allergies:</b> {booking.patientId?.allergies}
                    </p>
                    <p>
                      <b>Address:</b> {booking.patientId?.address.street},
                      {booking.patientId?.address.city},
                      {booking.patientId?.address.state},
                      {booking.patientId?.address.country}-
                      {booking.patientId?.address.pincode}
                    </p>
                    <p>
                      <b>Emergency Contact:</b> {booking.patientId?.econtact}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <b>Patient:</b> {booking.patientId?.name}
                    </p>
                  </>
                )}
              </div>

              <div>
                <p>
                  <b>Booked By:</b> {booking.userId?.name}
                </p>
                <p>
                  <b>Email:</b> {booking.userId?.email}
                </p>
                <p>
                  <b>Start Date:</b>{" "}
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
                <p>
                  <b>Estimated price:</b> ₹{booking.estimatedAmount}
                </p>
                <p>
                  <b>BookingID:</b> {booking._id.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-3 flex-wrap">
              {/* Accepted -> Ongoing */}
              {booking.status === "accepted" && (
                <button
                  onClick={() =>
                    setConfirmData({
                      bookingId: booking._id,
                      newStatus: "ongoing",
                    })
                  }
                  className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded font-medium transition"
                >
                  Start Care
                </button>
              )}

              {/* Ongoing -> Complete */}
              {booking.status === "ongoing" && (
                <button
                  onClick={() =>
                    setConfirmData({
                      bookingId: booking._id,
                      newStatus: "completeCard",
                    })
                  }
                  className="px-4 py-2 bg-green-400 hover:bg-green-500 text-white rounded font-medium transition"
                >
                  Complete Booking
                </button>
              )}

              {/* Completed -> Mark Paid */}
              {booking.status === "completed" &&
                booking.paymentStatus === "unpaid" && (
                  <button
                    onClick={() => setConfirmPaid(booking._id)}
                    className="px-4 py-2 bg-purple-400 hover:bg-purple-500 text-white rounded font-medium transition"
                  >
                    Mark Paid
                  </button>
                )}
            </div>

            {/* Completed Info */}
            {booking.status === "completed" && (
              <div className="mt-3 text-sm text-gray-700">
                <p>
                  <b>Final Amount:</b> ₹{booking.finalAmount}
                </p>
                <p>
                  <b>Payment Status:</b> {booking.paymentStatus}
                </p>
                <p>
                  <b>End Date:</b>{" "}
                  {booking.endDate
                    ? new Date(booking.endDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirm Card */}
      {confirmData && confirmData.newStatus !== "completeCard" && (
        <ConfirmCard
          title="Confirm Action"
          message={`Are you sure you want to move this booking to ${confirmData.newStatus}?`}
          onCancel={() => setConfirmData(null)}
          onConfirm={() =>
            updateBooking(confirmData.bookingId, {
              status: confirmData.newStatus,
            })
          }
        />
      )}

      {/* Complete Card */}
      {confirmData && confirmData.newStatus === "completeCard" && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-blue-50 via-green-50 to-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-blue-800 mb-4">
              Complete Booking
            </h2>
            <input
              type="number"
              placeholder="Final Amount"
              className="w-full p-2 rounded border mb-3"
              onChange={(e) =>
                setFinalAmount({
                  ...finalAmount,
                  [confirmData.bookingId]: e.target.value,
                })
              }
            />
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentStatus"
                  value="paid"
                  onChange={() =>
                    setFinalAmount({
                      ...finalAmount,
                      [`status_${confirmData.bookingId}`]: "paid",
                    })
                  }
                />
                Paid
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentStatus"
                  value="unpaid"
                  defaultChecked
                  onChange={() =>
                    setFinalAmount({
                      ...finalAmount,
                      [`status_${confirmData.bookingId}`]: "unpaid",
                    })
                  }
                />
                Unpaid
              </label>
            </div>
            <button
              onClick={() =>
                updateBooking(confirmData.bookingId, {
                  status: "completed",
                  finalAmount: finalAmount[confirmData.bookingId],
                  paymentStatus:
                    finalAmount[`status_${confirmData.bookingId}`] || "unpaid",
                })
              }
              className="w-full py-2 bg-green-400 hover:bg-green-500 text-white font-semibold rounded"
            >
              Complete Booking
            </button>
          </div>
        </div>
      )}
      {/* Confirm Mark Paid */}
      {confirmPaid && (
        <ConfirmCard
          title="Confirm Payment"
          message="Are you sure you want to mark this booking as paid?"
          onCancel={() => setConfirmPaid(null)}
          onConfirm={() => {
            updateBooking(confirmPaid, { paymentStatus: "paid" });
            setConfirmPaid(null);
          }}
        />
      )}
    </div>
  );
}
