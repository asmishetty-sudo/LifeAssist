"use client";

import { useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import toast from "react-hot-toast";
import ConfirmCard from "@/components/ConfirmCard";
import { PencilIcon, TrashIcon, PlusIcon } from "lucide-react";
import { useUser } from "@/context/userContext";

export default function ServicesPage() {
  const { token } = useUser();
  const { services, refreshAdminData } = useAdmin();

  const [editingService, setEditingService] = useState(null);
  const [addingService, setAddingService] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceType: "hourly",
    price: "",
    extraCost: "",
  });
  const [loading, setLoading] = useState(false);
  const [deleteService, setDeleteService] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      priceType: service.priceType,
      price: service.price,
      extraCost: service.extraCost,
    });
  };

  const handleSaveService = async () => {
    const { name, priceType, price, extraCost, description } = formData;
    if (!name || !priceType || !price || !extraCost) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      let res, data;

      if (addingService) {
        // Add new service
        res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/addServices`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            priceType,
            price: Number(price),
            extraCost: Number(extraCost),
          }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to add service");
        toast.success("Service added successfully!");
        refreshAdminData();
        

      } else if (editingService) {
        // Edit service
        res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/editService/${editingService._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              description,
              priceType,
              price: Number(price),
              extraCost: Number(extraCost),
            }),
          },
        );
        data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to update service");
        toast.success("Service updated successfully!");
        refreshAdminData();
      }

      // Reset
      setAddingService(false);
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        priceType: "hourly",
        price: "",
        extraCost: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/deleteServices/${serviceId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete service");
      toast.success("Service deleted successfully!");
      refreshAdminData(); // update context
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setDeleteService(null);
    }
  };

  return (
    <div className="sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* ---------------- Add Service Button ---------------- */}
      <button
        onClick={() => setAddingService(true)}
        className="flex items-center md:mx-0 mx-auto gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
      >
        <PlusIcon className="w-4 h-4" /> Add Service
      </button>

      {/* ---------------- Service Card (Add/Edit) ---------------- */}
      {(addingService || editingService) && (
        <div className="bg-white shadow-lg rounded-xl p-6 space-y-3 border">
          <h3 className="text-xl font-semibold text-gray-800">
            {addingService ? "Add New Service" : "Edit Service"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Service Name"
              className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              name="priceType"
              value={formData.priceType}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price"
              className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              name="extraCost"
              value={formData.extraCost}
              onChange={handleChange}
              placeholder="Extra Cost"
              className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="col-span-1 md:col-span-2 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setAddingService(false);
                setEditingService(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveService}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Services List ---------------- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div
            key={s._id}
            className="p-4 border rounded-xl bg-indigo-50 hover:bg-indigo-100 transition shadow-sm flex justify-between items-start"
          >
            <div>
              <p className="font-semibold text-lg text-indigo-700">
                {s.name} ({s.priceType})
              </p>
              <p className="text-gray-600 mt-1">
                {s.description || "No description"}
              </p>
              <p className="text-gray-800 mt-1 font-medium">
                Price: ₹{s.price} | Extra: ₹{s.extraCost}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(s)}
                className="p-1 rounded-md hover:bg-indigo-600 hover:text-white transition"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteService(s)}
                className="p-1 rounded-md hover:bg-red-600 hover:text-white transition"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ---------------- Confirm Delete ---------------- */}
      {deleteService && (
        <div className="">
        <ConfirmCard
          message={`Are you sure you want to delete ${deleteService.name}?`}
          onCancel={() => setDeleteService(null)}
          onConfirm={() => handleDeleteService(deleteService._id)}
        />
        </div>
      )}
    </div>
  );
}
