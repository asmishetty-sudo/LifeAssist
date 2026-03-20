import { CaregiverProvider } from "@/context/CaregiverContext";


export default function CaregiverLayout({ children }) {
  return (
    <div className="flex ">
      <CaregiverProvider>      
      <main className="flex-1 p-6 min-h-[calc(100vh-7rem)] ">
        {children}
      </main>
      </CaregiverProvider>
    </div>
  );
}