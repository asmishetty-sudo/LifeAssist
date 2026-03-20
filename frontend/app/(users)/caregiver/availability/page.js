"use client";

import { useState, useEffect } from "react";
import { useCaregiver } from "@/context/CaregiverContext";
import { useUser } from "@/context/userContext";
import toast from "react-hot-toast";
import { Plus, X, Clock, CalendarDays } from "lucide-react";
import ConfirmCard from "@/components/ConfirmCard";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Everyday",
];

export default function AvailabilityPage() {
  const { profile, loading } = useCaregiver();
  const { token } = useUser();

  const [availability, setAvailability] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  useEffect(() => {
    if (profile) {
      setAvailability(profile.availability || []);
    }
  }, [profile]);

  const handleAvailabilityChange = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const addAvailabilitySlot = () => {
    setAvailability([...availability, { day: "", startTime: "", endTime: "" }]);
  };

  const requestRemoveSlot = (index) => {
    setSlotToDelete(index);
    setConfirmOpen(true);
  };

  const confirmRemoveSlot = () => {
    const updated = availability.filter((_, i) => i !== slotToDelete);
    setAvailability(updated);
    setConfirmOpen(false);
    setSlotToDelete(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/info/updateavailability`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ availability }),
        }
      );

      const data = await res.json();

      if (res.ok) toast.success(data.message);
      else toast.error(data.message || "Unable to update");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading availability...</div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-3xl">

        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center gap-2 justify-center md:justify-start">
          <CalendarDays size={26} />
          Manage Availability
        </h1>

        <div className="bg-white shadow-lg rounded-xl p-4 lg:p-6 border border-gray-100">

          <h2 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
            <Clock size={18} />
            Weekly Availability
          </h2>

          <div className="space-y-3">
            {availability.map((slot, idx) => (
              <div
                key={idx}
                className="flex flex-wrap sm:flex-row items-center gap-2 lg:gap-4 lg:bg-blue-50 lg:border lg:border-blue-100 lg:p-3 rounded-lg"
              >
                <select
                  value={slot.day}
                  onChange={(e) =>
                    handleAvailabilityChange(idx, "day", e.target.value)
                  }
                  className="border rounded-md p-2 text-sm"
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    handleAvailabilityChange(idx, "startTime", e.target.value)
                  }
                  className="border rounded-md p-2 text-sm"
                />

                <span className="text-gray-400 text-sm">to</span>

                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) =>
                    handleAvailabilityChange(idx, "endTime", e.target.value)
                  }
                  className="border rounded-md p-2 text-sm"
                />

                <button
                  onClick={() => requestRemoveSlot(idx)}
                  className="ml-auto bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addAvailabilitySlot}
            className="mt-4 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} />
            Add Slot
          </button>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
            >
              {isSaving ? "Saving..." : "Save Availability"}
            </button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmCard
          title="Remove Slot"
          message="Are you sure you want to remove this availability slot?"
          onConfirm={confirmRemoveSlot}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

