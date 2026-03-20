"use client";
import { useRouter } from "next/navigation";
import { loginUser } from "./actions";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
const { user, login } = useUser();
  const router = useRouter();

  useEffect(() => {
  if (user) {
    router.push(`/${user.userType}`);
  }
}, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setLoading(true);
    try {
      const result = await loginUser(formData);
      if (result.success) {
        toast.success(result.message);
        // Save user info in context or cookie
        login(result.user,result.token);

        // Redirect based on first login
        if (result.firstLogin && result.user.userType === "caregiver") {
          router.push("/caregiver/setup");
        } else {
          router.push(`/${result.user.userType}`); // normal dashboard route
        }
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
        <h2 className="text-xl font-bold">Login</h2>

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

        <button
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded"
          type="submit"
        >
          Login
        </button>
        <p className="text-center text-gray-700">No Account? <Link className="text-green-600 hover:underline" href={"/register"}>Register Here</Link></p>
      </form>
    </div>
  );
}
