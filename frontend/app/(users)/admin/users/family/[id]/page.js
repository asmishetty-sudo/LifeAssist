"use client";

import { useAdmin } from "@/context/AdminContext";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function FamilyUserPage() {
  const { id } = useParams(); // family user id from URL
  const { users, patients, bookings, complaints, loading } = useAdmin();

  // Find the selected user
  const user = useMemo(() => users.find(u => u._id === id), [users, id]);

  // User's patients
  const userPatients = useMemo(
    () => patients.filter(p => p.userId === id),
    [patients, id]
  );

  // User's bookings
  const userBookings = useMemo(
    () => bookings.filter(b => b.userId === id),
    [bookings, id]
  );

  // User's complaints
  const userComplaints = useMemo(
    () => complaints.filter(c => c.userId === id),
    [complaints, id]
  );

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
  <h1 className="text-3xl font-bold text-indigo-600 border-b pb-2 mb-6">
    {user.name} - Profile
  </h1>

  {/* ---------------- BASIC INFO ---------------- */}
  <section className="bg-white shadow-md rounded-lg p-6 space-y-2">
    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Basic Info</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
      <p><span className="font-semibold">Email:</span> {user.email}</p>
      <p><span className="font-semibold">Status:</span> {user.isSuspended ? <span className="text-red-500">Suspended</span> : <span className="text-green-500">Active</span>}</p>
      <p><span className="font-semibold">Role:</span> {user.userType}</p>
      <p><span className="font-semibold">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  </section>

  {/* ---------------- PATIENTS ---------------- */}
  <section className="bg-white shadow-md rounded-lg p-6 space-y-4">
    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
      Patients ({userPatients.length})
    </h2>
    {userPatients.length === 0 ? (
      <p className="text-gray-400 italic">No patients added by this user.</p>
    ) : (
      <div className="space-y-3">
        {userPatients.map(p => (
          <div key={p._id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
            <p><span className="font-semibold">Name:</span> {p.name}</p>
            <p><span className="font-semibold">Age:</span> {p.age}</p>
            <p><span className="font-semibold">Gender:</span> {p.gender}</p>
            <p><span className="font-semibold">Medical Needs:</span> {p.medicalNeeds}</p>
            {p.address && (
              <p>
                <span className="font-semibold">Address:</span> {p.address.street}, {p.address.city}, {p.address.state}, {p.address.pincode}, {p.address.country}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </section>

  {/* ---------------- BOOKINGS ---------------- */}
  <section className="bg-white shadow-md rounded-lg p-6 space-y-4">
    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
      Bookings ({userBookings.length})
    </h2>
    {userBookings.length === 0 ? (
      <p className="text-gray-400 italic">No bookings for this user.</p>
    ) : (
      <div className="space-y-3">
        {userBookings.map(b => (
          <div key={b._id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
            <p><span className="font-semibold">Service:</span> {b.serviceId?.name ||"N/A"}</p>
            <p><span className="font-semibold">Status:</span> {b.status}</p>
            <p><span className="font-semibold">Payment Status:</span> {b.paymentStatus}</p>
            <p><span className="font-semibold">Start Date:</span> {new Date(b.startDate).toLocaleDateString()}</p>
            <p><span className="font-semibold">Estimated Amount:</span> ₹{b.estimatedAmount}</p>
          </div>
        ))}
      </div>
    )}
  </section>

  {/* ---------------- COMPLAINTS ---------------- */}
  <section className="bg-white shadow-md rounded-lg p-6 space-y-4">
    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
      Complaints ({userComplaints.length})
    </h2>
    {userComplaints.length === 0 ? (
      <p className="text-gray-400 italic">No complaints from this user.</p>
    ) : (
      <div className="space-y-3">
        {userComplaints.map(c => (
          <div key={c._id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
            <p><span className="font-semibold">Against:</span> {c.against?.fullName || "Unknown"}</p>
            <p><span className="font-semibold">Type:</span> {c.type}</p>
            <p><span className="font-semibold">Status:</span> {c.status}</p>
            <p><span className="font-semibold">Message:</span> {c.complain}</p>
            <p className="text-gray-400 text-sm"><span className="font-semibold">Created At:</span> {new Date(c.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    )}
  </section>
</div>
  );
}