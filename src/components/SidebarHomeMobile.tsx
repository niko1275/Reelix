"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"


import Link from "next/link"
import { Home, SquarePlay, Video,ThumbsUp,ListVideo,History, PlaySquare } from "lucide-react"
import { Separator } from "./ui/separator"


function SidebarItem({
  icon,
  text,
  isOpen,
  active = false,
  className = "",
}: {
  icon: React.ReactNode;
  text: string;
  isOpen: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center py-2 px-3 rounded-lg ${
        active ? "bg-secondary" : "hover:bg-secondary"
      } transition-colors mb-1 ${className}`}
    >
      <span className="text-lg">{icon}</span>
      {isOpen && <span className="ml-4">{text}</span>}
    </div>
  );
}
export default function SidebarHomeMobile() {
    const { state , isMobile} = useSidebar()
    const isopen2 = state === "expanded"  ? true : false
    const links = [
        {
          href: "/",
          label: "Inicio",
          icon: Home,
        },
  
        {
          href: "/subscriptions",
          label: "Suscripciones",
          icon: Video,
        },
   
      ]

     
    
return(
<Sidebar className="border-r overflow-hidden">
      <SidebarContent className="p-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold mb-6" />
          <SidebarGroupContent>
            <SidebarMenu className="space-y-8">
           

            <Link href="/">
          <SidebarItem icon={<Home />} text="Home" isOpen={isopen2} active />
          </Link>
         
          <Link href="/subscriptions">
          <SidebarItem icon={<PlaySquare />} text="Subscriptions" isOpen={isopen2} />
          </Link>
   

       
          <Link href="/playlist">
          <SidebarItem icon={<PlaySquare />} text="Playlists" isOpen={isopen2} />
          </Link>
                
          

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
)}