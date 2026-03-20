"use client";
import { useState, useMemo } from "react";
import { useUser } from "@/context/userContext";
import { useFamily } from "@/context/FamilyContext";
import { MapPin, Star, Search } from "lucide-react";
import Link from "next/link";
import BookingModal from "@/components/BookingModal";
import Image from "next/image";

export default function FamilyCaregiversPage() {
  const { token } = useUser();
  const { patients, caregivers, services } = useFamily();

  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  /* SEARCH FILTER */
  const filteredCaregivers = useMemo(() => {
    return caregivers.filter((c) => {
      const query = search.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(query) ||
        c.serviceArea?.city?.toLowerCase().includes(query) ||
        c.serviceArea?.state?.toLowerCase().includes(query)
      );
    });
  }, [search, caregivers]);

  return (
    <div className=" w-full px-3 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center md:text-left ">
          Available Caregivers
        </h1>

        {/* SEARCH */}
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* CAREGIVER GRID */}
      <div
        className="grid gap-6
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4"
      >
        {filteredCaregivers.map((caregiver) => (
          <div
            key={caregiver._id}
            className="bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-lg transition duration-300 p-5 flex flex-col"
          >
            {/* IMAGE */}
            <div className="flex justify-center mb-3">
              
              <Image
                src={
                  caregiver?.photo
                    ? `${caregiver.photo}`
                    : "/default-avatar.png"
                }
                alt={caregiver?.fullName || "Caregiver"}
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-full border-2 border-green-500"
              />
            </div>

            {/* NAME */}
            <h2 className="text-lg font-semibold text-green-700 text-center">
              {caregiver.fullName}
            </h2>

            {/* EXPERIENCE */}
            <p className="text-sm text-center text-gray-500 mb-2">
              {caregiver.experienceYears}+ years experience
            </p>

            {/* BIO */}
            <p className="text-sm text-gray-600 italic text-center mb-3 line-clamp-2">
              {caregiver.bio || "No bio available"}
            </p>

            {/* DETAILS */}
            <div className="space-y-1 text-sm text-gray-600 flex-grow">
              <p>
                <span className="font-semibold">Qualification:</span>{" "}
                {caregiver.qualifications?.join(", ")}
              </p>

              <p>
                <span className="font-semibold">Experience:</span>{" "}
                {caregiver.experienceYears} years
              </p>

              <p className="flex items-center gap-1">
                <MapPin size={16} className="text-green-600" />
                {caregiver.serviceArea.city}, {caregiver.serviceArea.state}
              </p>
            </div>

            {/* RATING */}
            <div className="flex items-center gap-1 mt-3">
              {caregiver.rating ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(caregiver.rating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="text-xs text-gray-500">
                    ({caregiver.nooffeedback})
                  </span>
                </>
              ) : (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                  New
                </span>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2 mt-4">
              <Link
                href={`/family/caregivers/${caregiver._id}`}
                className="flex-1 text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm"
              >
                View Profile
              </Link>

              <button
                onClick={() => {
                  setSelectedCaregiver(caregiver);
                  setShowModal(true);
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NO RESULTS */}
      {filteredCaregivers.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No caregivers found.
        </div>
      )}

      {/* BOOKING MODAL */}
      {showModal && (
        <BookingModal
          caregiver={selectedCaregiver}
          onClose={() => setShowModal(false)}
          patients={patients || []}
          services={services || []}
        />
      )}
    </div>
  );
}
