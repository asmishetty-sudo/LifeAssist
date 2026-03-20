"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Initialize user from cookies
  function init() { 
    const cookieUser = Cookies.get("user");
    const cookieToken = Cookies.get("token");
    if (cookieUser && cookieToken) {
      const parsedUser = JSON.parse(cookieUser);
      setUser(parsedUser);
      setToken(cookieToken);

      if (parsedUser.isSuspended) {
        router.push("/suspended");
      }
    } else {
      router.push("/");
    }

    setLoading(false);
  }

  useEffect(() => {
    init();
  }, []);

  // Login function: save user + token in cookies
  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);

    // Save in cookies for 7 days
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });
    Cookies.set("token", tokenValue, { expires: 7 });

    if (userData.isSuspended) {
      router.push("/suspended");
    }
  };

  // Logout function: remove cookies
  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove("user");
    Cookies.remove("token");
    router.push("/");
  };

  // Check user type
  const userCheck = (type) => {
    if (!user) return false; // Not logged in
    if (!type) return true; // Logged in, no type check
    return user.userType === type; // Check specific type
  };

  return (
    <UserContext.Provider
      value={{ user,setUser, login, logout, userCheck, loading, token, init }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);