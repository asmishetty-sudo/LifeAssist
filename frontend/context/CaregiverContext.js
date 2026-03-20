"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

const CaregiverContext = createContext();

export const CaregiverProvider = ({ children }) => {
  const { user, userCheck, token } = useUser(); // get user + check function
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const init = async () => {
    //  Wait for user to load
    if (!user) return;
    if (user?.isSuspended) {
      router.push("/suspended");
      return;
    }
    //  Check if logged in + is caregiver
    if (!userCheck("caregiver")) {
      if (!user)
        router.push("/"); // not logged in
      else router.push(`/${user.userType}`); // wrong type
      return;
    }
    // fetch services even if no profile
    const serviceRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/info/caregiverservices`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!serviceRes.ok) {
      setServices([]);
    } else {
      const data = await serviceRes.json();
      setServices(data.services || []);
    }
    //  Fetch caregiver profile
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/info/caregiver`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();

      // Redirect if no profile yet
      if (data.firstLogin) {
        router.push("/caregiver/setup");
      } else {
        setProfile(data.profile); // profile exists
      }

      //  Fetch caregiver bookings
      const bookingsRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/info/caregiverbookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!bookingsRes.ok) {
        setBookings([]);
      } else {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
        setFeedbacks(bookingsData.feedbacks || []);
      }
    } catch (error) {
      console.error("Error fetching caregiver profile:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    init();
  }, [user, router, userCheck]);

  return (
    <CaregiverContext.Provider
      value={{
        profile,
        setProfile,
        loading,
        bookings,
        feedbacks,
        services,
        init,
      }}
    >
      {children}
    </CaregiverContext.Provider>
  );
};

export const useCaregiver = () => useContext(CaregiverContext);
