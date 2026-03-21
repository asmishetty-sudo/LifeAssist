"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";
import ConfirmCard from "@/components/ConfirmCard";

export default function AdminComplaintsPage() {
  const { token } = useUser();
  const {
    complaints = [],
    users = [],
    caregivers = [],
    refreshAdminData,
  } = useAdmin();
  const [activeTab, setActiveTab] = useState("caregiver");
  const [loadingId, setLoadingId] = useState(null);
  const [reviewer, setReviewer] = useState(null);
  const router = useRouter();

  // 📌 Sort: pending first, then newest first
  const sortedComplaints = [...complaints]
    .filter((c) => c.type === activeTab)
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleReview = async (id) => {
    try {
      setLoadingId(id);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/complaints/${id}/review`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Complaint marked as reviewed");
      refreshAdminData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingId(null);
      setReviewer(null);
    }
  };

  const getUser = (id) => users.find((u) => u._id === id);
  const getCaregiver = (id) => caregivers.find((c) => c._id === id);

  return (
    <div className=" sm:p-6">
      <h1 className="text-xl sm:text-2xl text-center md:text-left text-blue-700 font-semibold mb-6">Complaints</h1>

      {/* 🔹 Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("caregiver")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === "caregiver" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Against Caregivers
        </button>

        <button
          onClick={() => setActiveTab("other")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === "other" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Other Queries
        </button>
      </div>

      {/* 🔹 Complaint List */}
      <div className="space-y-4">
        {sortedComplaints.length === 0 && (
          <p className="text-gray-500">No complaints found.</p>
        )}

        {sortedComplaints.map((complaint) => {
          const user = getUser(complaint.userId);
          const caregiver = getCaregiver(complaint.against);

          return (
            <div
              key={complaint._id}
              className="border rounded-lg p-4 shadow-sm bg-white flex justify-between items-start"
            >
              <div className="space-y-2 max-w-[70%]">
                <p className="text-sm text-gray-500">
                  {new Date(complaint.createdAt).toLocaleString()}
                </p>

                <p>
                  <strong>From:</strong> {user?.name || "Unknown User"}
                </p>
                <p>
                  <strong>ComplaintId:</strong> <span className="break-all">{complaint._id.toUpperCase()}</span>
                </p>
                {activeTab === "caregiver" && caregiver && (
                  <p>
                    <strong>Against:</strong>{" "}
                    <span
                      onClick={() =>
                        router.push(
                          `/admin/users/caregiver/${caregiver.userId}`,
                        )
                      }
                      className="text-blue-600 cursor-pointer hover:underline"
                    >
                      {caregiver.fullName}
                    </span>
                  </p>
                )}

                <p className="text-gray-700">{complaint.complain}</p>

                <p
                  className={`text-xs font-medium ${
                    complaint.status === "pending"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {complaint.status.toUpperCase()}
                </p>
              </div>

              {/* 🔹 Review Button */}
              <button
                disabled={
                  complaint.status === "reviewed" || loadingId === complaint._id
                }
                onClick={() => setReviewer(complaint)}
                className={`px-4 py-2 text-sm rounded-md font-medium transition ${
                  complaint.status === "reviewed"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {complaint.status === "reviewed"
                  ? "Reviewed"
                  : loadingId === complaint._id
                    ? "Updating..."
                    : "Review"}
              </button>
            </div>
          );
        })}
      </div>
      {reviewer && (
        <ConfirmCard
          message={`Are you sure you want to mark "${reviewer._id.toUpperCase()}" complaint as reviewed? ?`}
          onCancel={() => {
            setReviewer(null);
            setLoadingId(null);
          }}
          onConfirm={() => handleReview(reviewer._id)}
        />
      )}
    </div>
  );
}
