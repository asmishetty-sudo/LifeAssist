"use client";

import { useState } from "react";
import { useUser } from "@/context/userContext";
import toast from "react-hot-toast";

export default function SuspendedPage() {
  const { token } = useUser();

  const [openHelp, setOpenHelp] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmitComplaint = async (e) => {
  e.preventDefault();
  if (!message) {
    toast.error("Please enter a message");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/support/complaints/suspension`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      }
    );

    const data = await res.json();

    if (!res.ok) toast.error(data.message || "Failed to submit complaint");
    else {
      toast.success(data.message || "Complaint submitted");
      setMessage("");
      setOpenHelp(false);
    }
  } catch (error) {
    console.error(error);
    toast.error("Server error");
  }

  setLoading(false);
};

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8vh)] bg-red-50 px-4">

      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg">

        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Account Suspended
        </h1>

        <p className="text-gray-600 mb-6">
          Your account has been suspended by the admin due to policy
          violations or complaints.
        </p>

        <p className="text-gray-600">
          If you believe this is a mistake, you can contact support.
        </p>

        <button
          onClick={() => setOpenHelp(true)}
          className="mt-4 text-blue-600 font-semibold hover:underline"
        >
          Help?
        </button>

      </div>

      {/* Complaint Modal */}

      {openHelp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">

            <h2 className="text-xl font-semibold mb-4">
              Submit Complaint
            </h2>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">

              <textarea
                placeholder="Explain your issue..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded p-2"
                rows={4}
              />

              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => setOpenHelp(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}