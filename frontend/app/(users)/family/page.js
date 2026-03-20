"use client";

import { useMemo } from "react";
import { useFamily } from "@/context/FamilyContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Activity,
  Loader,
  PlayCircle,
  LoaderCircle,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);
import { useRouter } from "next/navigation";

export default function FamilyDashboard() {
  const { bookings = [], patients = [], loading } = useFamily();
  const router = useRouter();

  const analytics = useMemo(() => {
    const now = new Date();

    const total = bookings.length;

    const completed = bookings.filter((b) => b.status === "completed").length;

    const pending = bookings.filter((b) => b.status === "pending").length;

    const cancelled = bookings.filter(
      (b) => b.status === "cancelled" || b.status === "rejected",
    ).length;

    const ongoing = bookings.filter((b) => b.status === "ongoing").length;

    // Upcoming = startDate in future & not cancelled/rejected
    const upcoming = bookings.filter(
      (b) =>
        new Date(b.startDate) > now &&
        !["cancelled", "rejected"].includes(b.status),
    );

    // Total spent = completed bookings only
    const totalSpent = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.finalAmount || b.estimatedAmount || 0), 0);

    // Monthly booking trend (based on createdAt)
    const monthlyMap = {};

    bookings.forEach((b) => {
      const date = new Date(b.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!monthlyMap[key]) monthlyMap[key] = 0;
      monthlyMap[key]++;
    });

    const monthlyData = Object.entries(monthlyMap).map(([key, value]) => ({
      month: key,
      bookings: value,
    }));

    return {
      total,
      completed,
      pending,
      cancelled,
      ongoing,
      upcoming,
      totalSpent,
      monthlyData,
    };
  }, [bookings]);
  const chartData = {
    labels: analytics.monthlyData.map((m) => m.month),
    datasets: [
      {
        label: "Bookings",
        data: analytics.monthlyData.map((m) => m.bookings),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  // UI

  return (
    <div className="p-2 w-full space-y-6">
      <h1 className="text-3xl text-blue-600 font-bold text-center md:text-left">Dashboard</h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <DashboardCard
          title="Patients"
          value={patients.length}
          icon={<Users className="text-blue-600" />}
          bgColor="bg-gradient-to-br from-blue-500 to-blue-900 text-white"
        />
        <DashboardCard
          title="Total Bookings"
          value={analytics.total}
          icon={<Calendar className="text-purple-600" />}
          bgColor="bg-gradient-to-br from-purple-500 to-purple-900 text-white"
        />
        <DashboardCard
          title="Completed"
          value={analytics.completed}
          icon={<CheckCircle className="text-green-600" />}
          bgColor="bg-gradient-to-br from-green-500 to-green-900 text-white"
        />
        <DashboardCard
          title="Ongoing"
          value={analytics.ongoing}
          icon={<LoaderCircle className="text-indigo-600" />}
          bgColor="bg-gradient-to-br from-indigo-500 to-indigo-900 text-white"
        />
        <DashboardCard
          title="Pending"
          value={analytics.pending}
          icon={<Clock className="text-yellow-600" />}
          bgColor="bg-gradient-to-br from-yellow-500 to-yellow-900 text-white"
        />
        <DashboardCard
          title="Cancelled"
          value={analytics.cancelled}
          icon={<XCircle className="text-red-600" />}
          bgColor="bg-gradient-to-br from-red-500 to-red-900 text-white"
        />
        <DashboardCard
          title="Total Spent"
          value={`₹${analytics.totalSpent}`}
          icon={<DollarSign className="text-emerald-600" />}
          bgColor="bg-gradient-to-br from-emerald-500 to-emerald-900 text-white"
        />
      </div>

      {/* CHART SECTION */}
   <Card className="w-full max-w-full overflow-hidden">
  <CardHeader>
    <CardTitle>
      <div className="flex flex-wrap gap-2 items-center text-lg sm:text-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-yellow-500 via-blue-500 via-purple-500 to-indigo-600">
        Monthly Booking Trend
        <Activity className="text-indigo-600" />
      </div>
    </CardTitle>
  </CardHeader>

  <CardContent className="w-11/12 overflow-hidden">
    <div className="relative w-full max-w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[360px]">
      <Line
        data={chartData}
        options={chartOptions}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  </CardContent>
</Card>

      {/* UPCOMING BOOKINGS */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics.upcoming.length === 0 && (
            <p className="text-muted-foreground">No upcoming bookings</p>
          )}

          {analytics.upcoming.slice(0, 5).map((b) => (
            <div
              key={b._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between border p-3 rounded-xl gap-2"
            >
              <div>
                <p className="font-semibold">Service : {b.serviceId?.name}</p>

                <p className="text-sm text-gray-500">
                  Start: {new Date(b.startDate).toLocaleDateString()}
                </p>

                <p className="text-sm text-gray-500">
                  Time: {b.slot.startTime} - {b.slot.endTime}
                </p>
              </div>

              <span className="text-blue-600 font-medium capitalize">
                {b.status}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="fixed bottom-6 right-6 z-50 group">
        <div
          className="absolute right-16 top-1/2 -translate-y-1/2
               bg-gray-300 text-gray-600 text-sm
               px-3 py-1 rounded-md
               opacity-0 group-hover:opacity-100
               transition duration-300
               whitespace-nowrap"
        >
          Customer Support
        </div>

        <button
          onClick={() => router.push("/family/support")}
          className="w-14 h-14
               rounded-full
               bg-gradient-to-r from-blue-300 to-blue-700
               text-white text-2xl font-bold
               shadow-lg hover:scale-110
               transition duration-300"
        >
          ?
        </button>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, bgColor }) {
  return (
    <Card
      className={`rounded-2xl shadow-sm hover:shadow-md transition w-full  ${bgColor}`}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-white ">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
        <div className="p-2 sm:p-3 bg-gray-100 rounded-xl">{icon}</div>
      </CardContent>
    </Card>
  );
}
