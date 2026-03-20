"use client";

import { useFamily } from "@/context/FamilyContext";
import { useState } from "react";
import { Users, CreditCard, Lock, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";
import ConfirmCard from "@/components/ConfirmCard";

export default function FamilyProfilePage() {
  const {user}  =useUser()
  const {  patients = [], bookings = [], loading } = useFamily();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) return <div className="p-6">Loading...</div>;

  // Compute analytics for overview
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === "completed").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const cancelledBookings = bookings.filter(b => b.status === "cancelled" || b.status === "rejected").length;
  const totalSpent = bookings
    .filter(b => b.status === "completed")
    .reduce((sum, b) => sum + (b.finalAmount || b.estimatedAmount || 0), 0);

  return (
    <div className="p-2 w-full space-y-6">
      <h1 className="text-3xl font-bold text-center md:text-left text-blue-700">My Profile</h1>

      {/* TABS */}
      {/* ===================== */}
      <div className="flex justify-between border-b border-gray-200 space-x-2 sm:space-x-6 sm:text-base text-xs">
        <TabButton label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<Settings className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />} />
        <TabButton label="Patients" active={activeTab === "patients"} onClick={() => setActiveTab("patients")} icon={<Users className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />} />
        <TabButton label="Billing" active={activeTab === "billing"} onClick={() => setActiveTab("billing")} icon={<CreditCard className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />} />
        <TabButton label="Security" active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<Lock className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />} />
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <OverviewTab patients={patients} user={user} totalBookings={totalBookings} completedBookings={completedBookings} pendingBookings={pendingBookings} cancelledBookings={cancelledBookings} totalSpent={totalSpent} />
        )}

        {activeTab === "patients" && <PatientsTab patients={patients} />}

        {activeTab === "billing" && <BillingTab bookings={bookings} totalSpent={totalSpent} />}

        {activeTab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}

// TAB BUTTON COMPONENT
function TabButton({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 pb-2 font-medium transition-colors
        ${active ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-indigo-500"}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// OVERVIEW TAB
function OverviewTab({patients, user, totalBookings, completedBookings, pendingBookings, cancelledBookings, totalSpent }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <InfoCard title="Full Name" value={user?.name || "-"} />
      <InfoCard title="Email" value={user?.email || "-"} />
      <InfoCard title="Total Patients" value={patients?.length || "-"} />
      <InfoCard title="Total Bookings" value={totalBookings} />
      <InfoCard title="Completed Bookings" value={completedBookings} />
      <InfoCard title="Pending Bookings" value={pendingBookings} />
      <InfoCard title="Cancelled Bookings" value={cancelledBookings} />
      <InfoCard title="Total Spent" value={`₹${totalSpent}`} />
    </div>
  );
}

// =====================
// PATIENTS TAB
// =====================
function PatientsTab({ patients }) {
  return (
    <div className="space-y-4">
      {patients.length === 0 ? (
        <p className="text-gray-500">No patients added yet.</p>
      ) : (
        patients.map((p) => (
          <div key={p._id} className="border rounded-lg p-4 flex justify-start items-center">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-gray-500">Age: {p.age}, Gender: {p.gender}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// BILLING TAB
function BillingTab({ bookings, totalSpent }) {
  return (
    <div className="space-y-4">
      <p className="font-semibold text-lg">Total Spent: ₹{totalSpent}</p>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {bookings.map((b) => (
            <div key={b._id} className="flex justify-between border rounded-lg p-3">
              <div>
                <p className="font-semibold">Service : {b.serviceId?.name}</p>
                <p className="text-sm text-gray-500">Start Date: {new Date(b.startDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Status: {b.status}</p>
              </div>
              <p className="font-bold">₹{b.finalAmount || b.estimatedAmount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================
// SECURITY TAB
// =====================
function SecurityTab() {
  const { token, logout,init } = useUser();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // -------------------
  // CHANGE PASSWORD
  // -------------------
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
      } else {
        toast.success(data.message);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  // -------------------
  // DELETE ACCOUNT
  // -------------------
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
      } else {
        toast.success(data.message || "Account deleted successfully");
        logout(); // optional: log user out
        init()
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  return (
    <div className="space-y-4 max-w-md flex flex-col">
      {/* CHANGE PASSWORD BUTTON */}
      {!showPasswordForm && (
        <button
          onClick={() => setShowPasswordForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Change Password
        </button>
      )}

      {/* PASSWORD FORM */}
      {showPasswordForm && (
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow">
          <input
            type="password"
            placeholder="Old Password"
            className="border p-2 rounded"
            value={passwordData.oldPassword}
            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
          />
          <input
            type="password"
            placeholder="New Password"
            className="border p-2 rounded"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="border p-2 rounded"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => setShowPasswordForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Save
            </button>
          </div>
        </form>
      )}

      {/* DELETE ACCOUNT */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Delete Account
        </button>

      {/* CONFIRM CARD */}
      {showDeleteConfirm && (
        <ConfirmCard
          message="Are you sure you want to delete your account? This action cannot be undone."
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

// =====================
// INFO CARD
// =====================
function InfoCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}