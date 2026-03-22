"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

export default function PatientProfilePage() {
  const { id } = useParams();
  const { patients, bookings , caregivers,users } = useAdmin();

  const [activeTab, setActiveTab] = useState("pending");

  const patient = patients.find((p) => p._id === id);
  if (!patient) return <div className="p-6">Loading patient info...</div>;
const user = users.find(u => u._id === patient.userId);
  // Handle both populated and non-populated patientId
  const patientBookings = bookings.filter(
    (b) =>
      b.patientId?._id === patient._id 
  );

  const bookingStatusTabs = [
    "pending",
    "accepted",
    "ongoing",
    "completed",
    "cancelled",
  ];

  const filteredBookings = patientBookings.filter(
    (b) => b.status === activeTab
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ---------------- PATIENT HEADER ---------------- */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-xl shadow">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-indigo-600">
            {patient.name}
          </h1>
          <p className="text-gray-600">
            {patient.age ? `${patient.age} years old` : ""}
          </p>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Email:</strong> {user?.email || "N/A"}</p>
        </div>
      </div>

      {/* ---------------- MEDICAL INFO ---------------- */}
      <section className="bg-white shadow-md rounded-xl p-6 space-y-2">
        <h2 className="text-xl font-semibold border-b pb-2 mb-3 text-gray-800">
          Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Allergies:</strong> {patient.allergies || "None"}</p>
          <p><strong>Medical Needs:</strong> {patient.medicalNeeds || "None"}</p>
          <p><strong>Emergency Contact:</strong> {patient.econtact || "N/A"}</p>
          <p><strong>Address:</strong> {patient.address.street}, {patient.address.city}, {patient.address.state}, {patient.address.country}, {patient.address.pincode} </p>
        </div>
      </section>

      {/* ---------------- CUSTOM TABS ---------------- */}
      <div className="bg-white shadow-md rounded-xl p-4">
        <div className="flex flex-wrap gap-2 border-b pb-3 mb-4">
          {bookingStatusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-4 py-2 text-sm rounded-md transition ${
                activeTab === status
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
              }`}
            >
              {status.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ---------------- BOOKINGS LIST ---------------- */}
        {filteredBookings.length === 0 ? (
          <p className="text-gray-400 italic">
            No {activeTab} bookings.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <p>
                  <strong>Service:</strong>{" "}
                  {b.serviceId?.name || "Unknown"}
                </p>
                <p>
                  <strong>Caregiver:</strong>{" "}
                  {caregivers.find(c => c._id === b.caregiverId)?.fullName || "Unknown"}
                </p>
                <p><strong>Status:</strong> {b.status}</p>
                <p><strong>Payment:</strong> {b.paymentStatus}</p>
                <p>
                  <strong>Amount:</strong> ₹
                  {b.finalAmount || b.estimatedAmount}
                </p>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {new Date(b.startDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
