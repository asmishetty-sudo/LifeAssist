"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@/context/userContext";
import toast from "react-hot-toast";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user, token } = useUser();

  const [caregivers, setCaregivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(false);

  //  Protect admin routes
  const isAdmin = user?.userType === "admin";

  const fetchAllAdminData = async () => {
  if (!token || !isAdmin) return;
  try {
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/info/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }
    const adminData = data.data;
    setCaregivers(adminData.caregivers || []);
    setUsers(adminData.users || []);
    setPatients(adminData.patients || []);
    setBookings(adminData.bookings || []);
    setFeedbacks(adminData.feedbacks || []);
    setComplaints(adminData.complaints || []);
    setServices(adminData.services || []);

  } catch (error) {
    toast.error(error.message || "Failed to fetch admin data");
  } finally {
    setLoading(false);
  }
};

 useEffect(() => {
  if (!token || !isAdmin) return;

  fetchAllAdminData();

  const interval = setInterval(fetchAllAdminData, 20000);

  return () => clearInterval(interval);
}, [token, isAdmin]);

  return (
    <AdminContext.Provider
      value={{
        caregivers,
        users,
        patients,
        bookings,
        feedbacks,
        complaints,
        loading,
        services,
        refreshAdminData: fetchAllAdminData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);