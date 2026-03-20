"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function FeedbackCard({ booking, onClose, token ,init,removePending}) {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking._id,
          caregiverId: booking.caregiverId,
          rating,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to submit feedback");
      } else {
        toast.success("Feedback submitted successfully!");
        init()
        removePending(booking._id);
        onClose();
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Server error");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold mb-2">Feedback for {booking.serviceId?.name}</h2>

        <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={24}
          className={`cursor-pointer transition-colors ${
            n <= rating ? "text-yellow-400" : "text-gray-300"
          } hover:text-yellow-500`}
          onClick={() => setRating(n)}
          onMouseEnter={() => setRating(n)} // optional for hover effect
        />
      ))}
    </div>

        <textarea
          placeholder="Write your feedback..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded p-2"
          rows={4}
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}