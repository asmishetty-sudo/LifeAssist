import CaregiverNavbar from "@/components/CaregiverNavbar";
import { CaregiverProvider } from "@/context/CaregiverContext";


export default function CaregiverLayout({ children }) {
  return (
    <div className="flex ">
      <CaregiverProvider>      
        <CaregiverNavbar/>
      <main className="flex-1 md:ml-64 md:p-3 min-h-[calc(100vh-7rem)] ">
        {children}
      </main>
      </CaregiverProvider>
    </div>
  );
} 