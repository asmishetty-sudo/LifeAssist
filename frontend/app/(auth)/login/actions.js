"use server";

export async function loginUser(formData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  // call your backend API
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await response.json();
  return result; 
}
