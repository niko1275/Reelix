import { SidebarHome } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <div>
      <SidebarProvider defaultOpen={defaultOpen}>
       
        <div className="h-screen w-full flex flex-col">
          <header className="w-full h-16 border-b z-20">
            <Navbar />
          </header>
        
         
   
     


          <div className="flex flex-1">
          <SidebarHome isOpen={defaultOpen} />
          <main className="flex-1 p-4 overflow-auto">
            {children}
          </main>
        </div>

       
        </div>
       
        
       
      </SidebarProvider>
    </div>
  );
}
