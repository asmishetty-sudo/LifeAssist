"use client";

import { useState, useMemo } from "react";
import { useAdmin } from "@/context/AdminContext";
import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmCard from "@/components/ConfirmCard";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";

export default function PatientsListPage() {
  const {token}=useUser()
  const { patients, users, refreshAdminData } = useAdmin();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleView = (id) => {
    router.push(`/admin/patients/${id}`);
  };

  // 🔎 Search filter (by patient name or family name)
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const family = users.find((u) => u._id === p.userId);
      const patientName = p.name?.toLowerCase() || "";
      const familyName = family?.name?.toLowerCase() || "";

      return (
        patientName.includes(search.toLowerCase()) ||
        familyName.includes(search.toLowerCase())
      );
    });
  }, [patients, users, search]);

  // 🗑 Delete Patient
  const deletePatient = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/deletePatient/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete patient");

      toast.success("Patient deleted successfully");
      refreshAdminData();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="sm:p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl sm:text-3xl text-center md:text-left font-bold text-indigo-600 border-b pb-2 mb-4">
        All Patients
      </h1>

      {/* 🔎 SEARCH BAR */}
      <input
        type="text"
        placeholder="Search by patient or family name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/2 border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {filteredPatients.length === 0 ? (
        <p className="text-gray-400 italic">No patients found.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((p) => {
            const family = users.find((f) => f._id === p.userId);

            return (
              <li
                key={p._id}
                className="p-4 border rounded-xl bg-indigo-50 hover:bg-indigo-100 transition shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg text-indigo-700">
                    {p.name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Family Member: {family?.name || "Deleted Account / Unknown"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* 👁 VIEW */}
                  <div className="relative group">
                    <button
                      className="text-indigo-600 hover:text-indigo-800"
                      onClick={() => handleView(p._id)}
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

                  {/* 🗑 DELETE */}
                  <div className="relative group">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => setDeleteTarget(p)}
                    >
                      <Trash2 size={18} />
                    </button>
                    <span
                      className="absolute -top-8 left-1/2 -translate-x-1/2 
                      whitespace-nowrap text-xs bg-gray-800 text-white 
                      px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                      transition duration-200 pointer-events-none"
                    >
                      Delete Patient
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* 🔴 CONFIRM DELETE */}
      {deleteTarget && (
        <ConfirmCard
          message={`Are you sure you want to delete ${deleteTarget.name}?`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deletePatient(deleteTarget._id)}
        />
      )}
    </div>
  );
}
