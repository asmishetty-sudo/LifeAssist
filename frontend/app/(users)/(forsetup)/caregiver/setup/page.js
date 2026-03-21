"use client";

import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Upload, ImagePlus } from "lucide-react";
import { useCaregiver } from "@/context/CaregiverContext";
import Image from "next/image";

export default function CaregiverSetup() {
  const [loading, setLoading] = useState(false);
  const { user, login } = useUser();
  const router = useRouter();
  const { services } = useCaregiver();
  const today = new Date();

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    govId: "",
    address: "",
    phone: "",
    experienceYears: "",
    pastExperience: "",
    education: "",
    qualifications: [],
    servicesOffered: [],
    serviceArea: {
      city: "",
      state: "",
    },
    photo: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) login(JSON.parse(storedUser));
    }
    if (!user) router.push("/login");
  }, [user, login, router]);

  const minAgeDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle serviceArea separately
    if (["city", "state", "pincode"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        serviceArea: {
          ...prev.serviceArea,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      const alreadySelected = prev[field].includes(value);

      return {
        ...prev,
        [field]: alreadySelected
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value],
      };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG allowed");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append("formData", JSON.stringify(formData));
    submitData.append("userId", user.userId);

    if (formData.photo) {
      submitData.append("photo", formData.photo);
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/caregiver`,
        {
          method: "POST",
          body: submitData,
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        router.push("/caregiver");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error submitting profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white m-2 p-8 rounded-xl shadow-lg w-full max-w-3xl space-y-4 border border-blue-100"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-center text-blue-700">
          Caregiver Background Details
        </h2>

        <input
          name="fullName"
          placeholder="Full Legal Name"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded border-blue-300"
          required
        />

        <input
          type="date"
          name="dob"
          max={minAgeDate}
          value={formData.dob}
          onChange={handleChange}
          className="w-full p-2 border rounded border-blue-300"
          required
        />
        <div className="w-full flex gap-2">
          <input
            name="govId"
            placeholder="Government ID"
            value={formData.govId}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded border-blue-300"
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-1/2 p-2 border rounded border-blue-300"
            required
          />
        </div>

        <div className="flex gap-6">
          <label className="font-medium  block mb-2">Gender:</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={formData.gender === "Male"}
              onChange={handleChange}
              className="accent-green-600"
            />
            Male
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={formData.gender === "Female"}
              onChange={handleChange}
              className="accent-green-600"
            />
            Female
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Others"
              checked={formData.gender === "Others"}
              onChange={handleChange}
              className="accent-green-600"
            />
            Others
          </label>
        </div>
        <textarea
          name="address"
          placeholder="Current Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border rounded border-blue-300"
          required
        />

        {/* Experience */}
        <div className="flex gap-2 justify-between items-start">
          <textarea
            name="pastExperience"
            placeholder="Describe your experience"
            value={formData.pastExperience}
            onChange={handleChange}
            className="w-full p-2 border rounded border-blue-300"
            required
          />
          <input
            type="number"
            name="experienceYears"
            placeholder="Years of Experience"
            value={formData.experienceYears}
            onChange={handleChange}
            className="w-2/5  p-2 border rounded border-blue-300"
            required
            min={0}
          />
        </div>
        <textarea
          name="education"
          value={formData.education}
          onChange={handleChange}
          placeholder="Education / Special Certifications"
          className="w-full p-2 border rounded border-blue-300"
          required
        />
        <div>
          <label className="font-medium text-blue-700 block mb-2">
            Qualifications
          </label>

          <div className="grid grid-cols-2 gap-3  p-4 rounded-xl border border-blue-100">
            {[
              "ANM",
              "GNM",
              "B.Sc Nursing",
              "M.Sc Nursing",
              "CNA",
              "Physiotherapist",
              "Elder Care Assistant",
              "CPR Certified",
              "First Aid Certified",
              "Dementia Care Training",
              "Palliative Care Training",
            ].map((qualification) => (
              <label
                key={qualification}
                className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg shadow-sm hover:bg-green-50 transition"
              >
                <input
                  type="checkbox"
                  checked={formData.qualifications.includes(qualification)}
                  onChange={() =>
                    handleCheckboxChange("qualifications", qualification)
                  }
                  className="accent-green-600 w-4 h-4"
                />
                <span className="text-gray-700">{qualification}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="font-medium text-green-700 block mb-2">
            Services You Offer
          </label>

          <div className="grid grid-cols-2 gap-3  p-4 rounded-xl border border-green-100">
            {services.map((service) => (
              <label
                key={service._id}
                className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg shadow-sm hover:bg-blue-50 transition"
              >
                <input
                  type="checkbox"
                  checked={formData.servicesOffered.includes(service._id)}
                  onChange={() =>
                    handleCheckboxChange("servicesOffered", service._id)
                  }
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-gray-700">{service.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Service Area */}
        <label className="font-medium ">Services Area</label>
        <div className="grid grid-cols-3 gap-3">
          <input
            name="city"
            placeholder="City"
            value={formData.serviceArea.city}
            onChange={handleChange}
            className="p-2 border rounded border-blue-300"
            required
          />
          <input
            name="state"
            placeholder="State"
            value={formData.serviceArea.state}
            onChange={handleChange}
            className="p-2 border rounded border-blue-300"
            required
          />
        </div>

        <div className="space-y-2 w-1/2">
          <label className="block font-medium ">Upload Profile Photo</label>

          <div className="relative border-2 border-dashed border-blue-300 rounded-xl p-6 bg-gradient-to-br from-green-50 via-blue-50 to-white hover:border-green-400 transition">
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required
            />

            {!preview ? (
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <ImagePlus size={40} className="text-blue-500" />
                <p className="text-gray-600 font-medium">
                  Click or drag image to upload
                </p>
                <p className="text-xs text-gray-400">
                  JPG, JPEG, PNG (Max recommended 2MB)
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <Image
                  src={preview || "/default-avatar.png"}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-300 shadow"
                />
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <Upload size={16} />
                  Click to change photo
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-full flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="w-1/4 bg-blue-500 text-white py-2  text-bold rounded hover:opacity-90"
          >
            {loading ? "Submitting..." : "Submit Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
