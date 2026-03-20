"use client";
import { useRouter } from "next/navigation";
import { registerUser } from "./actions";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setLoading(true);
    try {
      const result = await registerUser(formData);
      if (result.success) {
        toast.success(result.message);
        router.push("/login");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Server error, try again");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-6 border rounded w-96"
      >
        <h2 className="text-xl font-bold">Register</h2>

        <input
          name="name"
          placeholder="Full Name"
          required
          className="border p-2 rounded"
        />

        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          required
          className="border p-2 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          minLength={6}
          required
          className="border p-2 rounded"
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          required
          className="border p-2 rounded"
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="userType" value="family" required />
            Family Member
          </label>

          <label className="flex items-center gap-2">
            <input type="radio" name="userType" value="caregiver" />
            CareGiver
          </label>
        </div>

        <button
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded"
          type="submit"
        >
          {loading ? "Submiting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
