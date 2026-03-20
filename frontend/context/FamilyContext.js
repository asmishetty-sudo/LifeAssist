"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./userContext"; // your existing user context

const FamilyContext = createContext();

export function FamilyProvider({ children }) {
  const { user, userCheck ,token} = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [services, setServices] = useState([]);
    const init = async () => {
      // Wait until user is loaded
      if (!user) return;
if (user?.isSuspended) {
  router.push("/suspended");
  return;
}
      // Check if user is of type 'family'
      if (!userCheck("family")) {
        if (!user) router.push("/"); // not logged in
        else router.push(`/${user.userType}`); // wrong type
        return;
      } 
 
      // Fetch family info from backend
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/info/family`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
 
        setPatients(data.patients || []);
        setBookings(data.bookings || []);
        setCaregivers(data.caregivers || []);
        setServices(data.services || []);
      } catch (error) {
        console.error("Error fetching family info:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    init();
  }, [user, userCheck, router]);

  return (
    <FamilyContext.Provider
      value={{ loading, patients, bookings, caregivers ,init,services}}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export const useFamily = () => useContext(FamilyContext);