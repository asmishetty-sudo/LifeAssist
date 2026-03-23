"use client";

import { useUser } from "@/context/userContext";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";

export default function BookingModal({
  caregiver,
  onClose,
  services = [],
  patients = [],
}) {
  const { token } = useUser();
  const [startDate, setStartDate] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDay, setSelectedDay] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [durationType, setDurationType] = useState("days");
  const [durationValue, setDurationValue] = useState(1);
  const [loading, setLoading] = useState(false);

  const filteredServices = useMemo(() => {
    if (!caregiver?.servicesOffered) return [];

    return services.filter((service) =>
      caregiver.servicesOffered.some((s) => s._id === service._id)
    );
  }, [caregiver, services]);

  /* ---------------- DERIVED: EXPERIENCE ---------------- */

  const experienceExtra =
    caregiver?.rating >= 4 && caregiver?.nooffeedback >= 15;

  /* ---------------- DERIVED: PRICE ---------------- */

  const calculatedPrice = useMemo(() => {
    if (
      !selectedService ||
      !startTime ||
      !endTime ||
      selectedDay.length === 0 ||
      !startDate
    ) {
      return 0;
    }

    const service = filteredServices.find(
      (s) => s._id === selectedService
    );
    if (!service) return 0;

    let basePrice = service.price;

    if (experienceExtra) {
      basePrice += service.extraCost || 0;
    }

    let total = 0;

    // Time calculation
    if (service.priceType === "hourly") {
      const start = new Date(`1970-01-01T${startTime}`);
      let end = new Date(`1970-01-01T${endTime}`);

// If end time is next day (overnight shift)
     if (end <= start) {
          end.setDate(end.getDate() + 1);
      }

     const hours = (end - start) / (1000 * 60 * 60);
      if (hours > 0) total = basePrice * hours;
      
    } else {
      total = basePrice;
    }

    // Day calculation
    const weekdaysMap = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    };

    const start = new Date(startDate);
    let daysCount = 0;

    if (durationType === "days") {
      daysCount = durationValue;
    } else if (durationType === "months") {
      for (let m = 0; m < durationValue; m++) {
        const year = start.getFullYear();
        const month = start.getMonth() + m;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let d = 1; d <= daysInMonth; d++) {
          const dayDate = new Date(year, month, d);

          const dayName = Object.keys(weekdaysMap).find(
            (key) => weekdaysMap[key] === dayDate.getDay()
          );

          if (
            selectedDay.includes(dayName) ||
            selectedDay.includes("Everyday")
          ) {
            daysCount += 1;
          }
        }
      }
    }

    total *= daysCount;

    return Number(total.toFixed(2));
  }, [
    selectedService,
    startTime,
    endTime,
    durationType,
    durationValue,
    selectedDay,
    startDate,
    filteredServices,
    experienceExtra,
  ]);

  /* ---------------- BOOKING ---------------- */

  const handleConfirmBooking = async () => {  
    if (
      !selectedPatient ||
      !selectedService ||
      selectedDay.length === 0 ||
      !startTime ||
      !endTime ||
      !startDate
    ) {
      toast.error("Please fill all required fields");
      return;
    }
     setLoading(true);
    const bookingData = {
      caregiverId: caregiver._id,
      patientId: selectedPatient,
      serviceId: selectedService,
      slot: {
        selectedDay,
        startTime,
        endTime,
      },
      startDate,
      durationType,
      durationValue,
      notes,
      estimatedAmount: calculatedPrice,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/info/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Booking failed");
        return;
      }

      toast.success(data.message);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    } finally {
    setLoading(false); 
  }
  };

  if (!caregiver) return null;

  return (
    <div className="fixed inset-0 pt-16 md:pl-72 bg-blue-900/40 flex justify-center items-center">
      <div className="bg-gradient-to-br   from-blue-50 to-white p-6 rounded-2xl w-2xl overflow-y-auto shadow-2xl border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Book Caregiver
        </h2>
        <div className="flex items-center justify-between gap-4">
          {/* Patient */}
          <div className="w-full ">
            <label className="block mt-2 text-sm font-medium text-blue-700">
              Select Patient
            </label>
            <select
              className="border border-blue-200 focus:ring-2 focus:ring-blue-400 w-full mt-1 p-2 rounded-lg"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="">Choose Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            {/* Service */}
            <label className="block mt-2 text-sm font-medium text-blue-700">
              Select Service
            </label>
            <select
              className="border border-blue-200 focus:ring-2 focus:ring-blue-400 w-full mt-1 p-2 rounded-lg"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">Choose Service</option>
              {filteredServices.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} - ₹{s.price} ({s.priceType})
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Duration */}
        <label className="block mt-4 text-sm font-medium text-blue-700">
          Duration
        </label>

        <div className="flex gap-3 mt-1">
          <input
            type="number"
            min="1"
            value={durationValue}
            onChange={(e) => setDurationValue(Number(e.target.value))}
            className="border border-blue-200 focus:ring-2 focus:ring-blue-400 p-2 rounded-lg w-24"
          />

          <select
            value={durationType}
            onChange={(e) => setDurationType(e.target.value)}
            className="border border-blue-200 focus:ring-2 focus:ring-blue-400 p-2 rounded-lg flex-1"
          >
            <option value="days">Days</option>
            <option value="months">Months </option>
          </select>
        </div>

        {/* Day */}
        <label className="block mt-4 text-sm font-medium text-blue-700">
          Select Days
        </label>
        <div className="grid grid-cols-4">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
            "Everyday",
          ].map((day) => (
            <label
              key={day}
              className="flex items-center gap-2 mt-2 sm:text-base text-xs"
            >
              <input
                type="checkbox"
                value={day}
                checked={selectedDay.includes(day)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedDay([...selectedDay, day]);
                  } else {
                    setSelectedDay(selectedDay.filter((d) => d !== day));
                  }
                }}
              />
              {day}
            </label>
          ))}
        </div>
        <div className="flex sm:flex-row flex-col items-center gap-6">
          <div>
            {/* Time */}

            <label className="block mt-4 text-sm font-medium text-blue-700">
              Select Time
            </label>
            <div className="flex gap-2 items-center">
              <label>From: </label>
              <input
                type="time"
                className="border border-blue-200 focus:ring-2 focus:ring-blue-400 w-full mt-1 p-2 rounded-lg"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <label>To: </label>
              <input
                type="time"
                className="border border-blue-200 focus:ring-2 focus:ring-blue-400 w-full mt-1 p-2 rounded-lg"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block sm:mt-4 text-sm font-medium text-blue-700">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-blue-200 w-full mt-1 p-2 rounded-lg"
            />
          </div>
        </div>
        {/* Notes */}
        <textarea
          placeholder="Medical notes / Instructions"
          className="border border-blue-200 focus:ring-2 focus:ring-blue-400 w-full mt-4 p-2 rounded-lg"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Price */}
        {calculatedPrice > 0 && (
          <div className="mt-4 bg-blue-100 p-3 rounded-lg text-blue-800 font-semibold text-center shadow">
            Estimated Price: ₹{calculatedPrice}
            {experienceExtra && (
              <p className="text-xs text-green-700 mt-1">
                *Includes experienced caregiver surcharge
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-blue-600">
            Cancel
          </button>

          <button
            onClick={handleConfirmBooking}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-xl shadow-md"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
