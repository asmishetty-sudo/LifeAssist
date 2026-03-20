"use client";

import { useState, useEffect } from "react";
import { useCaregiver } from "@/context/CaregiverContext";
import { Star, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";
import Image from "next/image";

export default function ProfilePage() {
  const { profile, loading } = useCaregiver();
  const { user, token } = useUser();
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!profile) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderStars = (rating = 0) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={18}
        className={
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }
      />
    ));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/info/updateprofile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (res.ok) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-green-50 to-white p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-100 to-green-100 p-8 flex flex-col md:flex-row items-center gap-6">
          {/* Profile Image */}
          <Image
            src={
              profile.photo
                ? `${process.env.NEXT_PUBLIC_BACKEND}/${profile.photo}`
                : "/default-avatar.png"
            }
            alt="Profile"
            width={128}
            height={128}
            className="rounded-full object-cover border-4 border-white shadow-md"
          />

          {/* Name + Rating */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>

            <div className="flex justify-center md:justify-start items-center gap-1 mt-2">
              {renderStars(profile.rating)}
              <span className="text-sm text-gray-600 ml-2">
                ({profile.nooffeedback || 0})
              </span>
            </div>

            <div className="mt-3 text-sm">
              <span
                className={`px-3 py-1 rounded-full text-white text-xs ${
                  profile.status === "approved"
                    ? "bg-green-500"
                    : profile.status === "pending"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              >
                {profile.status}
              </span>

              {profile.verified && (
                <span className="ml-3 text-green-600 font-medium">
                  ✔ Verified
                </span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => {
              if (isEditing) {
                setFormData(profile);
              }
              setIsEditing(!isEditing);
            }}
            className="flex items-center gap-2 bg-white border border-green-400 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition"
          >
            {isEditing ? (
              <>
                <X size={16} />
                Cancel
              </>
            ) : (
              <>
                <Pencil size={16} />
                Edit
              </>
            )}
          </button>
        </div>

        {/* Profile Details */}
        <div className="p-8 grid md:grid-cols-2 gap-6">
          <ProfileField label="Email" value={user.email} />
          <ProfileField label="Government ID" value={profile.govId} />
          <ProfileField
            label="Services Offered"
            value={
              profile.servicesOffered?.map((s) => s.name).join(", ") ||
              "Not provided"
            }
          />

          <ProfileField
            label="Qualifications"
            value={profile.qualifications?.join(", ") || "Not provided"}
          />

          <ProfileField
            label="Service Area"
            value={
              `${profile.serviceArea.city} , ${profile.serviceArea.state}` ||
              "Not provided"
            }
          />
          <EditableField
            label="Date of Birth"
            name="dob"
            className="w-full border-amber-200 border rounded"
            value={formData.dob?.split("T")[0] || ""}
          />

          <EditableField
            label="Phone"
            name="phone"
            value={formData.phone}
            isEditing={isEditing}
            onChange={handleChange}
          />

          <EditableTextarea
            label="Address"
            name="address"
            value={formData.address}
            isEditing={isEditing}
            onChange={handleChange}
          />

          <EditableField
            label="Experience (Years)"
            name="experienceYears"
            value={formData.experienceYears}
            isEditing={isEditing}
            onChange={handleChange}
          />

          <EditableTextarea
            label="Education"
            name="education"
            value={formData.education}
            isEditing={isEditing}
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <EditableTextarea
              label="Bio"
              name="bio"
              value={formData.bio}
              isEditing={isEditing}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <EditableTextarea
              label="Past Experience"
              name="pastExperience"
              value={formData.pastExperience}
              isEditing={isEditing}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="px-8 pb-8">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----- Components ----- */

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  );
}

function EditableField({ label, name, value, isEditing, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      {isEditing ? (
        <input
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400"
        />
      ) : (
        <p className="text-gray-800 font-medium">{value}</p>
      )}
    </div>
  );
}

function EditableTextarea({ label, name, value, isEditing, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      {isEditing ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          rows={3}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400"
        />
      ) : (
        <p className="text-gray-800 font-medium">{value}</p>
      )}
    </div>
  );
}
