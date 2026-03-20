"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function CaregiverProfilePage() {
  const { id } = useParams();
  const { caregivers, bookings, feedbacks, complaints } = useAdmin();
  const bookingStatusTabs = [
    "pending",
    "accepted",
    "ongoing",
    "completed",
    "cancelled",
  ];
  const mainTabs = ["Bookings", "Feedbacks", "Complaints"];
  const [activeMainTab, setActiveMainTab] = useState(mainTabs[0]);
  const [activeBookingTab, setActiveBookingTab] = useState(
    bookingStatusTabs[0],
  );

  const caregiver = caregivers.find((c) => c.userId._id === id);
  if (!caregiver) return <div>Loading caregiver info...</div>;

  const caregiverBookings = bookings.filter(
    (b) => b.caregiverId === caregiver._id,
  );
  const caregiverFeedbacks = feedbacks.filter(
    (f) => f.caregiverId === caregiver._id,
  );
  const caregiverComplaints = complaints.filter(
    (c) => c.against === caregiver._id,
  );

  const totalEarnings = caregiverBookings
    .filter((b) => b.paymentStatus == "paid")
    .reduce((acc, b) => acc + (b.finalAmount || 0), 0);

  const avgRating =
    caregiverFeedbacks.length > 0
      ? (
          caregiverFeedbacks.reduce((acc, f) => acc + f.rating, 0) /
          caregiverFeedbacks.length
        ).toFixed(1)
      : "N/A";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* -------- CAREGIVER HEADER -------- */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Image
          src={
            caregiver.photo
              ? `${process.env.NEXT_PUBLIC_BACKEND}/${caregiver.photo}`
              : "/default-avatar.png"
          }
          alt={caregiver.fullName}
          width={128}
          height={128}
          className="rounded-full object-cover border-2 border-indigo-500"
        />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-indigo-600">
            {caregiver.fullName}
          </h1>
          <p className="text-gray-600">{caregiver.bio}</p>
          <p>
            <strong>Status:</strong>{" "}
            {caregiver.verified ? (
              <span className="text-green-500">Verified</span>
            ) : (
              <span className="text-red-500">Not Verified</span>
            )}
          </p>
          <p>
            <strong>Rating:</strong> {avgRating} ⭐ ({caregiverFeedbacks.length}{" "}
            reviews)
          </p>
          <p>
            <strong>Total Earnings:</strong> ₹{totalEarnings}
          </p>
        </div>
      </div>

      {/* -------- BASIC INFO -------- */}
      <section className="bg-white shadow-md rounded-lg p-6 space-y-2">
        <h2 className="text-xl font-semibold border-b pb-2 mb-3 text-gray-800">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p>
            <strong>Email:</strong> {caregiver.userId?.email || "Unknown"}
          </p>
          <p>
            <strong>Phone:</strong> {caregiver.phone}
          </p>
          <p>
            <strong>DOB:</strong> {new Date(caregiver.dob).toLocaleDateString()}
          </p>
          <p>
            <strong>Gender:</strong> {caregiver.gender}
          </p>
          <p>
            <strong>Experience:</strong> {caregiver.experienceYears} years
          </p>
          <p>
            <strong>Education:</strong> {caregiver.education}
          </p>
          <p>
            <strong>Qualifications:</strong>{" "}
            {caregiver.qualifications.join(", ")}
          </p>
          <p>
            <strong>Services:</strong>{" "}
            {caregiver.servicesOffered?.map((s) => s.name).join(", ")}
          </p>
          <p>
            <strong>Address:</strong> {caregiver.address}
          </p>
          <p>
            <strong>Bio:</strong> {caregiver.bio}
          </p>
        </div>
      </section>

      {/* -------- CUSTOM TABS -------- */}
      <div>
        {/* Main Tabs */}
        <div className="flex space-x-1 bg-indigo-100 p-1 rounded-lg mb-4">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`w-full py-2.5 text-sm font-medium rounded-lg ${
                activeMainTab === tab
                  ? "bg-white shadow text-indigo-700"
                  : "text-indigo-500 hover:bg-white/[0.3]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Panels */}
        {activeMainTab === "Bookings" && (
          <div>
            {/* Booking Status Tabs */}
            <div className="flex  space-x-2 overflow-x-auto mb-3">
              {bookingStatusTabs.map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveBookingTab(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeBookingTab === status
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {status.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Booking List */}
            <div className="space-y-3">
              {caregiverBookings.filter((b) => b.status === activeBookingTab)
                .length === 0 && (
                <div className="text-gray-400 italic p-3">
                  No {activeBookingTab} bookings.
                </div>
              )}
              {caregiverBookings
                .filter((b) => b.status === activeBookingTab)
                .map((b) => {
                  const feedback = caregiverFeedbacks.find(
                    (f) => f.bookingId === b._id,
                  );
                  return (
                    <div
                      key={b._id}
                      className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <p>
                        <strong>Service:</strong> {b.serviceId?.name}
                      </p>
                      <p>
                        <strong>Patient:</strong>{" "}
                        {b.patientId?.name || "Unknown"}
                      </p>
                      <p>
                        <strong>Status:</strong> {b.status}
                      </p>
                      <p>
                        <strong>Payment:</strong> {b.paymentStatus}
                      </p>
                      <p>
                        <strong>Amount:</strong> ₹
                        {b.finalAmount || b.estimatedAmount}
                      </p>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {new Date(b.startDate).toLocaleDateString()}
                      </p>
                      {feedback && (
                        <p className="text-green-600">
                          <strong>Feedback:</strong> {feedback.rating}⭐ -{" "}
                          {feedback.message}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeMainTab === "Feedbacks" && (
          <div className="space-y-3">
            {caregiverFeedbacks.length === 0 && (
              <p className="text-gray-400 italic">No feedbacks yet.</p>
            )}
            {caregiverFeedbacks.map((f) => (
              <div
                key={f._id}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <p>
                  <strong>BookingId:</strong> {f.bookingId}
                </p>
                <p>
                  <strong>User / Family Member:</strong> {f.userId?.name}
                </p>
                <p>
                  <strong>Rating:</strong> {f.rating} ⭐
                </p>
                <p>
                  <strong>Message:</strong> {f.message}
                </p>
                <p className="text-gray-400 text-sm">
                  <strong>Date:</strong>{" "}
                  {new Date(f.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeMainTab === "Complaints" && (
          <div className="space-y-3">
            {caregiverComplaints.length === 0 && (
              <p className="text-gray-400 italic">
                No complaints against this caregiver.
              </p>
            )}
            {caregiverComplaints.map((c) => (
              <div
                key={c._id}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <p>
                  <strong>By:</strong> {c.userId?.name || "Unknown"}
                </p>
                <p>
                  <strong>Type:</strong> {c.type}
                </p>
                <p>
                  <strong>Status:</strong> {c.status}
                </p>
                <p>
                  <strong>Message:</strong> {c.complain}
                </p>
                <p className="text-gray-400 text-sm">
                  <strong>Created At:</strong>{" "}
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
