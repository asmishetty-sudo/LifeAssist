"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import { useUser } from "@/context/userContext";
import toast from "react-hot-toast";
import PatientCard from "@/components/PatientCard";

export default function PatientsPage() {
  const { loading, patients ,init } = useFamily();
  const { token } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    medicalNeeds: "",
    street: "",
    econtact: "",
    allergies: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const handleRemove = async (patientId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/info/removepatient/${patientId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        init(); 
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddPatient = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/info/addpatients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        init()
        toast.success(data.message);
        setFormData({
          name: "",
          age: "",
          gender: "",
          medicalNeeds: "",
          street: "",
          city: "",
          econtact:"",
          allergies:"",
          state: "",
          pincode: "",
          country: "",
        });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (loading)
    return <p className=" flex items-center justify-center">Loading...</p>;

  return (
    <div className="w-full p-3 md:p-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:ml-0 ml-12 font-bold text-blue-700">My Patients</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-0.5 sm:gap-2 bg-blue-600 text-white px-2 text-sm sm:text-base sm:px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />Add Patient
        </button>
      </div>

      {/* Patient Cards */}
      {patients.length === 0 ? (
        <p className="text-center text-gray-500 mt-20">
          No patients added yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <PatientCard
          key={patient._id}
          patient={patient}
          onRemove={handleRemove} // pass remove handler
        />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0  bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full mt-18 max-w-lg p-6 rounded-xl shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-4 text-blue-700">
              Add New Patient
            </h2>

            <div className="space-y-2">
              <div className="flex gap-3">
              <input
                name="name"
                placeholder="Patient Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <input
                name="age"
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              </div>
              <p className="text-sm mb-2 text-gray-600">Gender</p>

              <div className="flex gap-6">
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
                name="medicalNeeds"
                placeholder="Medical Needs"
                value={formData.medicalNeeds}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <textarea
                name="allergies"
                placeholder="Allergies if any"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
<input
                name="econtact"
                placeholder="Emergency Contact"
                value={formData.econtact}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <input
                name="street"
                placeholder="Apartment/House/Street"
                value={formData.street}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <input
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>

              <button
                onClick={handleAddPatient}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
