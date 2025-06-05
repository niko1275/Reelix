"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"


import Link from "next/link"
import { Home, SquarePlay, Video,ThumbsUp,ListVideo,History } from "lucide-react"
import { Separator } from "./ui/separator"

export default function SidebarHomeMobile() {
    const { state , isMobile} = useSidebar()

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
           

              {links.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium text-gray-800"
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                </SidebarMenuItem>
              ))}
                
          

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
)}