"use client";

import { useState, useEffect, useCallback } from "react";
import { useFamily } from "@/context/FamilyContext";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";
import Cookies from "js-cookie";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CustomerSupport() {
  const { user, setUser, token } = useUser();
  const [openSection, setOpenSection] = useState(null);
  const { bookings } = useFamily();
  const [complaints, setComplaints] = useState([]);
  const [username, setUsername] = useState("");

  const [caregiverComplaint, setCaregiverComplaint] = useState({
    caregiverId: "",
    message: "",
  });

  const [otherComplaint, setOtherComplaint] = useState({
    message: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/support/complaints`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      return data.complaints || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [token]);
  // Fetch previous complaints
  useEffect(() => {
    if (!user) return;
    const fetcher = async () => {
      const refreshed = await fetchComplaints();
      setComplaints(refreshed);
    };
    fetcher();
  }, [user, fetchComplaints]);

  const handleSubmitCaregiverComplaint = async (e) => {
    e.preventDefault();
    if (!caregiverComplaint.caregiverId || !caregiverComplaint.message) {
      toast.error("Please select a caregiver and enter a message");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/support/complaints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: "caregiver", ...caregiverComplaint }),
        },
      );

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        toast.error(data.message || `Server error: ${res.status}`);
      } else {
        toast.success(data.message || "Complaint submitted successfully");
        setCaregiverComplaint({ caregiverId: "", message: "" });
        setOpenSection(null);

        // Refresh complaints
        const refreshed = await fetchComplaints();
        setComplaints(refreshed);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went Wrong");
    }
  };

  const handleSubmitOtherComplaint = async (e) => {
    e.preventDefault();
    if (!otherComplaint.message) {
      toast.error("Please enter a message");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/support/complaints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: "other", ...otherComplaint }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to submit complaint");
      } else {
        toast.success(data.message);
        setOtherComplaint({ message: "" });
        setOpenSection(null);
        const refreshed = await fetchComplaints();
        setComplaints(refreshed);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passwordData),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
      } else {
        toast.success(data.message);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setOpenSection(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  //change username
  const handleChangeUsername = async (e) => {
    e.preventDefault();

    if (!username) {
      toast.error("Enter Username");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/change-username`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
      } else {
        toast.success(data.message);
        const updatedUser = { ...user, name: username };
        Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 });
        setUser({ ...user, name: username });
        setUsername("");
        setOpenSection(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full  mx-auto p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-blue-700 text-center md:text-left">
        Customer Support
      </h1>

      {/* Accordion */}
      <div className="space-y-4">
        <div className="border border-gray-300 rounded-xl shadow-sm">
          <button
            className="w-full text-left px-4 py-3 font-semibold text-gray-500 flex justify-between items-center"
            onClick={() =>
              setOpenSection(openSection === "help" ? null : "help")
            }
          >
            How does it work?
            <span>{openSection === "help" ? "▲" : "▼"}</span>
          </button>
          {openSection === "help" && (
            <div className=" bg-gradient-to-br from-blue-50 via-green-50 to-white p-3 sm:p-8 flex justify-center">
              <div className="max-w-5xl w-full space-y-3 sm:space-y-8">
                <h3 className="text-xl sm:text-3xl font-bold text-blue-700 text-center">
                  Help Manual
                </h3>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-blue-100">
                  <h4 className="text-lg sm:text-2xl font-semibold text-blue-700 mb-3">
                    1. Adding Patients
                  </h4>

                  <p className="text-gray-700">
                    Before booking a caregiver you must add the patient details.
                  </p>

                  <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 p-4 rounded flex items-center gap-2">
                    Add patients here
                    <ArrowRight className="w-4 h-4 text-blue-700" />
                    <Link
                      href="/family/patients"
                      className="text-blue-700 font-semibold underline ml-1"
                    >
                      Manage Patients
                    </Link>
                  </div>

                  <p className="text-sm text-gray-600 mt-3">
                    Provide correct details such as medical needs, allergies,
                    address and emergency contact to help caregivers prepare
                    properly.
                  </p>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-green-100">
                  <h4 className="text-lg sm:text-2xl font-semibold text-green-700 mb-3">
                    2. Finding Caregivers
                  </h4>

                  <p className="text-gray-700">
                    You can browse and select caregivers based on their skills,
                    availability, rating and feedback.
                  </p>

                  <div className="mt-3 bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-center gap-2">
  Look for verified caregivers here
  <ArrowRight className="w-4 h-4 text-green-700" />

  <Link
    href="/family/caregivers"
    className="text-green-700 font-semibold underline ml-1 flex items-center gap-1"
  >
    Browse Caregivers
  </Link>
</div>

                  <ul className="list-disc ml-6 text-gray-600 mt-3 space-y-1">
                    <li>Only verified caregivers can receive bookings.</li>
                    <li>
                      Check caregiver feedback and ratings before booking.
                    </li>
                    <li>
                      Experienced caregivers with strong feedback may cost
                      slightly more.
                    </li>
                  </ul>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-purple-100">
                  <h4 className="text-lg sm:text-2xl font-semibold text-purple-700 mb-3">
                    3. Booking & Payment Guidelines
                  </h4>

                  <ul className="list-disc ml-6 text-gray-700 space-y-2">
                    <li>
                      When booking a caregiver the platform will show an
                      <span className="font-semibold">
                        {" "}
                        estimated total cost
                      </span>
                      .
                    </li>

                    <li>
                      The final amount may sometimes be lower if the caregiver
                      chooses to give a discount.
                    </li>

                    <li>
                      Caregivers cannot charge more than the estimated amount
                      without a valid reason.
                    </li>
                  </ul>

                  <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <strong>Important:</strong>
                    If a caregiver asks for a higher payment, politely ask for
                    the reason before paying.
                  </div>

                  <p className="text-gray-600 mt-3">
                    Always review the booking details carefully before
                    confirming payment.
                  </p>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-red-100">
                  <h4 className="text-lg sm:text-2xl font-semibold text-red-600 mb-3">
                    4. Complaints & Disputes
                  </h4>

                  <ul className="list-disc ml-6 text-gray-700 space-y-2">
                    <li>
                      If a caregiver behaves unfairly or violates platform rules
                      you may submit a complaint.
                    </li>

                    <li>Complaints should only be used for serious issues.</li>

                    <li>
                      Please avoid raising complaints for minor
                      misunderstandings.
                    </li>
                  </ul>

                  <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    Try to communicate respectfully and resolve small issues
                    with the caregiver first.
                  </div>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg sm:text-2xl font-semibold text-gray-700 mb-3">
                    General Tips
                  </h4>

                  <ul className="list-disc ml-6 text-gray-700 space-y-2">
                    <li>Provide accurate patient information.</li>
                    <li>Check caregiver ratings and feedback.</li>
                    <li>Maintain respectful communication.</li>
                    <li>Always confirm service schedules clearly.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Complaint Against Caregiver */}
        <div className="border border-gray-300 rounded-xl shadow-sm">
          <button
            className="w-full text-left px-4 py-3 font-semibold text-gray-500 flex justify-between items-center"
            onClick={() =>
              setOpenSection(openSection === "caregiver" ? null : "caregiver")
            }
          >
            Complaint Against a Caregiver?
            <span>{openSection === "caregiver" ? "▲" : "▼"}</span>
          </button>
          {openSection === "caregiver" && (
            <form
              className="p-4 space-y-3 bg-gray-50 rounded-b-xl"
              onSubmit={handleSubmitCaregiverComplaint}
            >
              <label className="block">
                Caregiver:
                <select
                  value={caregiverComplaint.caregiverId}
                  onChange={(e) =>
                    setCaregiverComplaint((prev) => ({
                      ...prev,
                      caregiverId: e.target.value,
                    }))
                  }
                  className="w-full mt-1 border rounded p-2"
                  required
                >
                  <option value="">Select caregiver</option>
                  {/* Get unique caregivers from bookings */}
                  {Array.from(
                    new Map(
                      bookings
                        .filter((b) =>
                          [
                            "accepted",
                            "ongoing",
                            "completed",
                            "cancelled",
                          ].includes(b.status),
                        )
                        .map((b) => [b.caregiverId._id, b.caregiverId]),
                    ).values(),
                  ).map((caregiver) => (
                    <option key={caregiver._id} value={caregiver._id}>
                      {caregiver.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                Complaint:
                <textarea
                  value={caregiverComplaint.message}
                  onChange={(e) =>
                    setCaregiverComplaint((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full mt-1 border rounded p-2"
                  placeholder="Describe your issue"
                  required
                />
              </label>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          )}
        </div>

        {/* Other Complaint */}
        <div className="border border-gray-300 rounded-xl shadow-sm">
          <button
            className="w-full text-left px-4 py-3 font-semibold text-gray-500 flex justify-between items-center"
            onClick={() =>
              setOpenSection(openSection === "other" ? null : "other")
            }
          >
            Have a complaint or facing any issue? Let us know.
            <span>{openSection === "other" ? "▲" : "▼"}</span>
          </button>
          {openSection === "other" && (
            <form
              className="p-4 space-y-3 bg-gray-50 rounded-b-xl"
              onSubmit={handleSubmitOtherComplaint}
            >
              <label className="block">
                Message:
                <textarea
                  value={otherComplaint.message}
                  onChange={(e) =>
                    setOtherComplaint({ message: e.target.value })
                  }
                  rows={4}
                  className="w-full mt-1 border rounded p-2"
                  placeholder="Describe your request or issue"
                  required
                />
              </label>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          )}
        </div>

        {/* Change Password */}
        <div className="border border-gray-300 rounded-xl shadow-sm">
          <button
            className="w-full text-left px-4 py-3 font-semibold text-gray-500 flex justify-between items-center"
            onClick={() =>
              setOpenSection(openSection === "password" ? null : "password")
            }
          >
            Change Password
            <span>{openSection === "password" ? "▲" : "▼"}</span>
          </button>
          {openSection === "password" && (
            <form
              className="p-4 space-y-3 bg-gray-50 rounded-b-xl"
              onSubmit={handleChangePassword}
            >
              <input
                type="password"
                placeholder="Old Password"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    oldPassword: e.target.value,
                  }))
                }
                className="w-full border rounded p-2"
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="w-full border rounded p-2"
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full border rounded p-2"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Change Password
              </button>
            </form>
          )}
        </div>

        {/* Chnage user Name */}
        <div className="border border-gray-300 rounded-xl shadow-sm">
          <button
            className="w-full text-left px-4 py-3 font-semibold text-gray-500 flex justify-between items-center"
            onClick={() =>
              setOpenSection(openSection === "username" ? null : "username")
            }
          >
            Change Username
            <span>{openSection === "username" ? "▲" : "▼"}</span>
          </button>
          {openSection === "username" && (
            <form
              className="p-4 space-y-3 bg-gray-50 rounded-b-xl"
              onSubmit={handleChangeUsername}
            >
              <input
                type="text"
                placeholder="New UserName"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded p-2"
                required
              />

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Change UserName
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Previous Complaints */}
      <div className="mt-8">
        <h2 className="text-md text-green-700 sm:text-xl font-semibold mb-4">
          Your Previous Complaints
        </h2>
        {complaints.length === 0 ? (
          <p>No complaints submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div
                key={c._id}
                className={`p-4 rounded-lg shadow flex justify-between items-center ${
                  c.status === "reviewed"
                    ? "bg-green-50 border-green-400"
                    : "bg-gray-50 border-gray-300"
                } border`}
              >
                <div>
                  <p className="font-semibold">
                    {c.type === "caregiver"
                      ? `Caregiver Complaint`
                      : "Other Complaint"}
                  </p>
                  {c.against && (
                    <p>Against: {c.against.fullName || c.against}</p>
                  )}
                  <p>{c.complain}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-white font-semibold text-sm ${
                    c.status === "reviewed" ? "bg-green-500" : "bg-gray-400"
                  }`}
                >
                  {c.status === "reviewed" ? "Reviewed" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
