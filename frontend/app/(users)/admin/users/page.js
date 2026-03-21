"use client";

import { useState, useMemo } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Search, Trash2, Eye, Ban, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ConfirmCard from "@/components/ConfirmCard";
import { useUser } from "@/context/userContext";

export default function AdminUsersPage() {
  const { users, refreshAdminData } = useAdmin();
  const { token } = useUser();
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  // 🔎 Search filter
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  const handleViewProfile = (user) => {
    if (user.userType === "family") {
      router.push(`users/family/${user._id}`);
    } else if (user.userType === "caregiver") {
      router.push(`users/caregiver/${user._id}`);
    } else if (user.userType === "admin") {
      toast("Admin profile cannot be viewed", { icon: "⚠️" });
    }
  };
  // 🚫 Suspend / Activate
  const statusChangeUser = async (user) => {
    setLoadingId(user._id);
    setStatusTarget(user);
  };
  const toggleUserStatus = async (id, currentStatus) => {
    try {
      setLoadingId(id);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/users/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("User status updated");
      refreshAdminData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingId(null);
       setStatusTarget(null);
    }
  };

  // Delete user
  const deleteUser = async (user) => {
    setLoadingId(user._id);
    setDeleteTarget(user);
  };

  const confirmDeleteUser = async (id) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("User deleted");
      refreshAdminData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="sm:p-6 space-y-3 sm:space-y-6 w-full">
      <h1 className="text-xl sm:text-3xl text-blue-700 font-bold text-center md:text-left">Manage Users</h1>

      {/* 🔎 Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* 📋 Users Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Name</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}

            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.userType}</td>

                {/* Status Badge */}
                <td>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.isSuspended
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {user.isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>

                {/* Actions */}
                <td className="flex gap-4 items-center py-4">
                  {/* View */}
                  <div className="relative group">
                    <button
                      className="text-indigo-600 hover:text-indigo-800"
                      onClick={() => {
                        handleViewProfile(user);
                      }}
                    >
                      <Eye size={18} />
                    </button>
                    <span
                      className="absolute -top-8 left-1/2 -translate-x-1/2 
                     whitespace-nowrap text-xs bg-gray-800 text-white 
                     px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                     transition duration-200 pointer-events-none"
                    >
                      View Details
                    </span>
                  </div>

                  {/* Suspend / Activate */}
                  <div className="relative group">
                    <button
                      className="text-yellow-600 hover:text-yellow-800"
                      disabled={loadingId === user._id}
                      onClick={() => statusChangeUser(user)}
                    >
                      {user.isSuspended ? (
                        <CheckCircle size={18} className="text-green-600 hover:text-green-800" />
                      ) : (
                        <Ban size={18} />
                      )}
                    </button>
                    <span
                      className="absolute -top-8 left-1/2 -translate-x-1/2 
                     whitespace-nowrap text-xs bg-gray-800 text-white 
                     px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                     transition duration-200 pointer-events-none"
                    >
                      {user.isSuspended ? "Unsuspend User" : "Suspend User"}
                    </span>
                  </div>

                  {/* Delete */}
                  <div className="relative group">
                    <button
                      className="text-red-600 hover:text-red-800"
                      disabled={loadingId === user._id}
                      onClick={() => deleteUser(user)}
                    >
                      <Trash2 size={18} />
                    </button>
                    <span
                      className="absolute -top-8 left-1/2 -translate-x-1/2 
                     whitespace-nowrap text-xs bg-gray-800 text-white 
                     px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                     transition duration-200 pointer-events-none"
                    >
                      Delete User
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deleteTarget && (
        <ConfirmCard
          message={`Are you sure you want to delete ${deleteTarget.name}?`}
          onCancel={() => {
            setDeleteTarget(null);
            setLoadingId(null);
          }}
          onConfirm={() => confirmDeleteUser(deleteTarget._id)}
        />
      )}
      {statusTarget && (
        <ConfirmCard
          message={
            statusTarget.isSuspended
              ? `Are you sure you want to activate ${statusTarget.name}?`
              : `Are you sure you want to suspend ${statusTarget.name}?`
          }
          onCancel={() => {
            setStatusTarget(null);
            setLoadingId(null);
          }}
          onConfirm={() =>
            toggleUserStatus(statusTarget._id, statusTarget.isSuspended)
          }
        />
      )}
    </div>
  );
}
