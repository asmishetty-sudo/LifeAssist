"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function PatientCard({ patient, onRemove }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
    <div className="relative bg-gradient-to-br from-blue-50 via-green-50 to-white p-5 rounded-xl shadow border border-green-100">
      {/* Remove Button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
        title="Remove Patient"
      >
        <X size={16} />
      </button>

      {/* Patient Details */}
      <h2 className="text-lg font-semibold text-blue-700">{patient.name}</h2>
      <p className="text-sm text-gray-600 mt-1">
        <span className="font-medium">Age:</span> {patient.age}
      </p>
      <p className="text-sm text-gray-600 mt-1">
        <span className="font-medium">Gender:</span> {patient.gender || "N/A"}
      </p>
      <p className="text-sm text-gray-600 mt-1">
        <span className="font-medium">Medical Needs:</span> {patient.medicalNeeds}
      </p>
      <p className="text-sm text-gray-600 mt-1">
        <span className="font-medium">Allergies:</span> {patient.allergies || "none"}
      </p>
      <p className="text-sm text-gray-600 mt-1">
        <span className="font-medium">Emergency Contact:</span> {patient.econtact || "none"}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        <span className="font-medium">Address:</span>{" "}
        {patient.address?.street}, {patient.address?.city}, {patient.address?.state}, {patient.address?.pincode}, {patient.address?.country}
      </p>
</div>
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 rounded-xl">
          <div className="bg-gradient-to-br from-blue-50 via-green-50 to-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center border border-green-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">
              Remove Patient
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove <span className="font-medium">{patient.name}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  onRemove(patient._id);
                  setShowConfirm(false);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-blue-200 hover:bg-blue-300 text-blue-800 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}