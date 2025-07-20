import { SidebarHome } from "@/components/Sidebar";
import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HeaderHistorial } from "./components/HeaderHistorial";
// Layout personalizado para la sección de liked videos, sin navbar global
export default async function LikedVideosLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (

    <div>
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="h-screen w-full flex flex-col">
          <div className="flex flex-1">
          <SidebarHome isOpen={defaultOpen} />
          <main className="flex-1 p-4 overflow-auto">
            <HeaderHistorial title="Historial de Visualización"/>
            {children}
          </main>
        </div>

       
        </div>
       
        
       
      </SidebarProvider>
    </div>
  );
} 