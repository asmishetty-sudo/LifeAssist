import AdminSideBar from "@/components/AdminSideBar";
import { AdminProvider } from "@/context/AdminContext";


export default function AdminLayout({ children }) {
  return (
    <div>
    <AdminProvider>
      <AdminSideBar/>
            <main className="flex-1 md:ml-64 p-6 min-h-[calc(100vh-7rem)] ">
              {children}
            </main>
    </AdminProvider>
    </div>
  );
}