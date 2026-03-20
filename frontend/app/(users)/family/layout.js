import FamilySideBar from "@/components/FamilySideBar";
import { FamilyProvider } from "@/context/FamilyContext";

export default function FamilyLayout({ children }) {
  return (
    <div className="flex ">
      <FamilyProvider>
        <FamilySideBar />
        <main className="flex-1 md:ml-72 md:p-6 bg-green-50 ">
          <div className="p-2 bg-gradient-to-br flex flex-col items-center from-green-50 via-green-100 to-white min-h-[calc(100vh-7rem)] ">
            {children}
          </div>
        </main>
      </FamilyProvider>
    </div>
  );
}
