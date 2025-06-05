import type { Metadata } from "next";
import { Providers } from "../providers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { Navbar } from "@/components/Navbar";
import { NavbarStudio } from "@/components/studio/NavbarStudio";
import { AppSidebar } from "@/components/studio/StudioSidebar";
import { cookies } from "next/headers"
import NavbarStudioSection from "@/components/studio/NavbarStudioSection";

export const metadata: Metadata = {
  title: "Studio",
  description: "Studio section",
};

export default async function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
 
  return (
    <Providers>
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="flex flex-col h-screen w-full">
          <header className="w-full h-16 border-b z-20 z-index-100">
            <NavbarStudioSection/>
          </header>
          <div className="flex flex-1">
            <AppSidebar/>
            <main className="flex-1 p-4 overflow-auto">
              {children}
            </main>
          </div>
        </div>
   
      </SidebarProvider>
    </Providers>
  );
} 