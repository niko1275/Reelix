"use client"

import { Inter } from "next/font/google";
import { SidebarStudio } from "@/components/studio/StudioSidebar";
import { NavbarStudio } from "@/components/studio/NavbarStudio";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export function StudioLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className={inter.className}>
      <div className="min-h-screen flex flex-col">
        {/* Navbar fijo en la parte superior */}
        <div className="h-16">
          <NavbarStudio />
        </div>
        
        {/* Contenedor principal */}
        <div className="flex flex-1">
          {/* Sidebar para desktop */}
          <aside 
            className={cn(
              "hidden md:block border-r bg-background",
              "transition-all duration-300 ease-in-out",
              isCollapsed ? "w-16" : "w-64 lg:w-72"
            )}
          >
            <div className="h-full overflow-y-auto">
              <SidebarStudio />
            </div>
          </aside>

          {/* Sidebar para móvil */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden fixed top-20 left-4 z-50"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SidebarStudio />
            </SheetContent>
          </Sheet>
          
          {/* Contenido principal */}
          <main 
            className={cn(
              "w-full p-4",
              "transition-all duration-300 ease-in-out",
              isCollapsed ? "md:ml-16" : "md:ml-64 lg:ml-72"
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 