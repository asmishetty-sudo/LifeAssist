"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmCard from "@/components/ConfirmCard";
import { useUser } from "@/context/userContext";

export default function CaregiversPage() {
  const {token} = useUser()
  const { caregivers, users, refreshAdminData } = useAdmin(); // token from context
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(""); // "review", "verify", "reject"

  const statuses = ["pending", "review", "approved", "rejected"];
  const [activeTab, setActiveTab] = useState("pending");

  // Filter caregivers by tab and search
  const filteredCaregivers = caregivers
    .filter(c => c.status === activeTab)
    .filter(c =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      users.find(u => u._id === c.userId)?.email?.toLowerCase().includes(search.toLowerCase())
    );

  const updateCaregiverStatus = async (caregiverId, status) => {
    setLoadingId(caregiverId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/caregivers/${caregiverId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      toast.success(`Caregiver status updated to ${status.toUpperCase()}`);
      refreshAdminData();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoadingId(null);
      setConfirmTarget(null);
      setConfirmAction("");
    }
  };

  const handleActionClick = (caregiver, action) => {
    setConfirmTarget(caregiver);
    setConfirmAction(action);
  };

  const handleView = (userId) => {
    router.push(`/admin/users/caregiver/${userId}`);
  };

  return (
    <div className="sm:p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl sm:text-3xl text-center md:text-left font-bold text-indigo-600 border-b pb-2 mb-4">
        Caregivers Management
      </h1>

      {/* ---------------- Search ---------------- */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-md"
        />
      </div>

      {/* ---------------- Tabs ---------------- */}
      <div className="flex gap-3 mb-4">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-1 text-sm sm:text-base sm:px-4 py-2 rounded-md font-medium transition ${
              activeTab === status
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ---------------- Caregiver Table ---------------- */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-left table-auto border-collapse">
          <thead className="bg-indigo-50">
            <tr>
              <th className="px-1 sm:px-4 py-3 border-b">Full Name</th>
              <th className="px-1 sm:px-4 py-3 border-b">Email</th>
              <th className="px-1 sm:px-4 py-3 border-b">Verified</th>
              <th className="px-1 sm:px-4 py-3 border-b">Status</th>
              <th className="px-1 sm:px-4 py-3 border-b">Rating</th>
              <th className="px-1 sm:px-4 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCaregivers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400 italic">
                  No caregivers found
                </td>
              </tr>
            ) : (
              filteredCaregivers.map(c => {
                return (
                  <tr key={c._id} className="hover:bg-gray-50 transition">
                    <td className="px-1 sm:px-4 py-2">{c.fullName}</td>
                    <td className="px-1 sm:px-4 py-2">{c.userId?.email || "N/A"}</td>
                    <td className="px-1 sm:px-4 py-2">{c.verified ? "Yes" : "No"}</td>
                    <td className="px-1 sm:px-4 py-2 font-semibold">{c.status.toUpperCase()}</td>
                    <td className="px-1 sm:px-4 py-2">{c.rating?.toFixed(1) || "-"}</td>
                    <td className="px-1 sm:px-4 py-2 flex gap-2">
                      {activeTab === "pending" && (
                        <button
                          disabled={loadingId === c._id}
                          onClick={() => handleActionClick(c, "review")}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Review
                        </button>
                      )}
                      {activeTab === "review" && (
                        <>
                        <button
                            onClick={() => handleView(c.userId._id)}
                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleActionClick(c, "approved")}
                            disabled={loadingId === c._id}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleActionClick(c, "rejected")}
                            disabled={loadingId === c._id}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                          
                        </>
                      )}
                      {["approved", "rejected"].includes(activeTab) && (
                        <button
                          onClick={() => handleView(c.userId._id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                        >
                          View
                        </button>
                        
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- Confirm Modal ---------------- */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <ConfirmCard
            message={`Are you sure you want to ${
              confirmAction === "review"
                ? "move this caregiver to review"
                : confirmAction === "verify"
                ? "verify this caregiver"
                : "reject this caregiver"
            }?`}
            onCancel={() => {
              setConfirmTarget(null);
              setConfirmAction("");
              setLoadingId(null);
            }}
            onConfirm={() =>
              updateCaregiverStatus(confirmTarget._id, confirmAction === "review" ? "review" : confirmAction)
            }
          />
        </div>
      )}
    </div>
  );
}