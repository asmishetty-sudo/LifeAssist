"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";
import { useCaregiver } from "@/context/CaregiverContext";
import { Star } from "lucide-react";
import Cookies from "js-cookie";
import ConfirmCard from "@/components/ConfirmCard";

export default function CustomerSupport() {
  const { user, token, setUser } = useUser();
  const [openSection, setOpenSection] = useState(null);
  const [deleteshow, setdeleteshow] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [username, setUsername] = useState("");
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
      }
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
  }, [user,fetchComplaints]);

  

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
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
      } else {
        toast.success(data.message || "Account deleted successfully");
        logout(); // optional: log user out
        init();
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  return (
    <div className="w-full  mx-auto p-6">
      <h1 className="text-2xl text-gray-700 font-bold mb-6 text-center md:text-left">Settings</h1>

      {/* Accordion */}
      <div className="space-y-4">
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

        {/* Delete account */}
        <div className="border border-gray-300 rounded-xl shadow-sm">
          <button
            className="w-full text-left px-4 py-3 font-semibold text-gray-500 flex justify-between items-center"
            onClick={() =>
              setOpenSection(openSection === "delete" ? null : "delete")
            }
          >
            Delete Account
            <span>{openSection === "delete" ? "▲" : "▼"}</span>
          </button>
          {openSection === "delete" && (
            <div className=" m-2">
              <button
                onClick={() => setdeleteshow(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
        <h1 className="text-2xl text-blue-700 font-bold mb-6">Help?</h1>
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
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white p-2 sm:p-6 flex justify-center">
              <div className="max-w-5xl w-full space-y-4 sm:space-y-8">
                <h3 className="text-xl sm:text-3xl font-bold text-green-700 text-center">
                  Caregiver Help Manual
                </h3>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-green-100">
                  <h4 className="text-lg sm:text-2xl font-semibold text-green-700 mb-3">
                    1. Caregiver Profile Setup
                  </h4>

                  <p className="text-gray-700">
                    When setting up your caregiver profile you must provide
                    accurate and honest information.
                  </p>

                  <ul className="list-disc ml-6 mt-3 text-gray-700 space-y-2">
                    <li>Provide correct personal details.</li>
                    <li>List your services clearly.</li>
                    <li>Set correct availability.</li>
                    <li>Add valid contact information.</li>
                  </ul>

                  <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    Profiles containing false or misleading information may be
                    rejected before approval.
                  </div>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-blue-100">
                  <h4 className="text-lg sm:text-2xl font-semibold text-blue-700 mb-3">
                    2. Verification Process
                  </h4>

                  <p className="text-gray-700">
                    Caregivers must complete the verification process before
                    receiving bookings.
                  </p>

                  <ul className="list-disc ml-6 text-gray-700 mt-3 space-y-2">
                    <li>Only verified caregivers appear in search results.</li>
                    <li>Unverified profiles cannot receive bookings.</li>
                    <li>Verification helps maintain platform safety.</li>
                  </ul>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-purple-100">
                  <h4 className="text-lg sm:text-2xl font-semibold text-purple-700 mb-3">
                    3. Booking & Payment Rules
                  </h4>

                  <ul className="list-disc ml-6 text-gray-700 space-y-2">
                    <li>
                      You will receive booking requests based on your
                      availability.
                    </li>

                    <li>
                      The platform generates an estimated service cost for
                      bookings.
                    </li>

                    <li>You may offer discounts if you wish.</li>
                  </ul>

                  <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    Charging more than the estimated amount without a valid
                    reason may result in complaints and account review.
                  </div>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-orange-100">
                  <h4 className="text-lg sm:text-2xl font-semibold text-orange-600 mb-3">
                    4. Professional Conduct
                  </h4>

                  <ul className="list-disc ml-6 text-gray-700 space-y-2">
                    <li>Communicate respectfully with families.</li>
                    <li>Arrive on time for scheduled services.</li>
                    <li>Provide care according to the service booked.</li>
                    <li>Maintain professional behavior at all times.</li>
                  </ul>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-6 border border-yellow-100">
                  <h5 className="text-lg sm:text-2xl font-semibold text-yellow-600 mb-3">
                    5. Ratings & Feedback
                  </h5>

                  <p className="text-gray-700">
                    Families can leave ratings and feedback after completed
                    bookings.
                  </p>

                  <ul className="list-disc ml-6 text-gray-700 mt-3 space-y-2">
                    <li>Good feedback improves your visibility.</li>
                    <li>High ratings help build trust.</li>
                    <li>Consistent negative feedback may lead to review.</li>
                    <p className="mt-4 bg-green-100 border-l-4 border-green-700 p-4 rounded">
                      Caregivers with an average rating of{" "}
                      <span className="inline-flex items-center gap-1">
                        <Star
                          fill="yellow"
                          className="text-yellow-300"
                          size={15}
                        />
                        4.0
                      </span>{" "}
                      or higher may receive additional earnings due to their
                      proven experience.
                    </p>
                  </ul>
                </div>
              </div>
            </div>
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
            Have a complaint or facing any issue? Let us know how we can help.
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
      </div>

      {/* Previous Complaints */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Your Previous Complaints</h3>
        <p className="my-3 text-sm text-gray-500">
          (Your problem will be reviewed with 24-48 working hours)
        </p>

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
      {/* CONFIRM CARD */}
      {deleteshow && (
        <ConfirmCard
          message="Are you sure you want to delete your account? This action cannot be undone."
          onConfirm={handleDeleteAccount}
          onCancel={() => setdeleteshow(false)}
        />
      )}
    </div>
  );
}
