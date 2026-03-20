"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import BookingModal from "@/components/BookingModal";
import { useUser } from "@/context/userContext";
import { useFamily } from "@/context/FamilyContext";
import Image from "next/image";

export default function CaregiverProfilePage() {
  const { id } = useParams();
  const { token, user } = useUser();
  const { services, patients, caregivers } = useFamily();

  const [showBooking, setShowBooking] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

   const caregiver = caregivers?.find((c) => c._id === id);

  if (!caregiver) return <p>Loading...</p>;

  if (notFound) {
    return <h1 className="text-center mt-10 text-red-600">User Not Found</h1>;
  }

  if (error) {
    return <h1 className="text-center mt-10">Something went wrong</h1>;
  }

  return (
    <div className=" min-h-screen mx-auto bg-white shadow-xl rounded-2xl p-3 w-full">
      {/* Photo */}
      <div className="flex justify-center">
        <Image
          src={
            caregiver?.photo
              ? `${caregiver.photo}`
              : "/default-avatar.png"
          }
          alt={caregiver?.fullName || "Caregiver"}
          width={192}
          height={192}
          className="w-48 h-48 rounded-full object-cover border-4 border-green-200 shadow-md"
        />
      </div>

      {/* Basic Info */}
      <h1 className="text-3xl font-bold text-center text-blue-700 mt-6">
        {caregiver.fullName}
      </h1>
      <p className=" mt-3 text-center text-green-700">
        <strong> {caregiver.experienceYears} years +</strong> experience{" "}
      </p>
      <p className="text-center text-gray-600  max-w-2xl mx-auto leading-relaxed">
        {caregiver.bio}
      </p>

      {/* Divider */}
      <div className="my-8 border-t border-blue-100"></div>

      {/* Professional Info */}
      <div className="grid md:grid-cols-2 gap-8 mx-3">
        <div className="bg-blue-50 p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-blue-700 mb-3">
            Professional Details
          </h2>

          <p className="mb-3">
            <strong className="font-semibold text-green-700">
              Experience:
            </strong>{" "}
            {caregiver.pastExperience} years
          </p>

          <p className="font-semibold text-green-700">Qualifications:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            {caregiver.qualifications?.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>

          <p className="font-semibold text-green-700">Services Offered:</p>
          <ul className="list-disc list-inside text-gray-700">
            {caregiver.servicesOffered?.map((s, i) => (
              <li key={i}>{s.name}</li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-blue-700 mb-3">
            Availability & Area
          </h2>

          <p className="mb-3">
            <strong className="font-semibold text-green-700">
              Service Area:
            </strong>{" "}
            {caregiver.serviceArea?.city}, {caregiver.serviceArea?.state}
          </p>

          <p className="font-semibold text-green-700">Availability:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            {Array.isArray(caregiver.availability) &&
            caregiver.availability.length > 0 ? (
              caregiver.availability.map((slot, i) => (
                <li key={i}>
                  {slot.day} : {slot.startTime} - {slot.endTime}
                </li>
              ))
            ) : (
              <li className="text-gray-400">No availability info set</li>
            )}
          </ul>

          <p>
            <strong className="font-semibold text-green-700">Rating:</strong>{" "}
            <span className="text-yellow-500 font-semibold">
              {caregiver.rating || "New User"}
            </span>
          </p>
        </div>
      </div>

      {/* FAMILY VIEW */}
      {user.userType === "family" && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowBooking(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md transition"
          >
            Book Now
          </button>
        </div>
      )}

      {showBooking && (
        <BookingModal
          caregiver={caregiver}
          onClose={() => setShowBooking(false)}
          patients={patients || []}
          services={services || []}
        />
      )}
    </div>
  );
}
