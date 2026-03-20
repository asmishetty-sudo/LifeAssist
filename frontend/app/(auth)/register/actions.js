"use server";

export async function registerUser(formData) {
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    userType: formData.get("userType"),
  };

  if (data.password !== data.confirmPassword) {
    return { success: false, message: "Passwords do not match" };
  }

  // call your backend API
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await response.json();
  return result; 
}
