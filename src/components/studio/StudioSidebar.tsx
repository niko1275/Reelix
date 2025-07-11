"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,

} from "@/components/ui/sidebar"
import { UserAvatar } from "../user-avatar/user-avatar"
import {  useUser } from "@clerk/nextjs"
import Link from "next/link";
import { Video } from "lucide-react";

export function AppSidebar() {
  const { user } = useUser();

  
  return (
    <Sidebar className="bg-white border-r border-gray-200 shadow-sm">
      <SidebarContent className="p-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold mb-6">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-6">
              <div className="flex justify-center mb-8 flex-col items-center">
                <UserAvatar
                  imageUrl={user?.imageUrl || ""}
                  name={user?.fullName || ""}
                  className="w-44 h-44 rounded-full border-2 border-gray-300"
                />
                <p className="text-lg font-semibold">
                  {user?.fullName}
                </p>
              </div>
  
              <SidebarMenuItem>
                <Link
                  href="/studio"
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer font-medium"
                >
                  <span>Content</span>
                  <Video className="w-5 h-5" />
                </Link>
              </SidebarMenuItem>
  
              <SidebarMenuItem>
                <Link
                  href="/"
                  className="block text-gray-700 hover:text-red-600 transition-colors duration-200 cursor-pointer font-medium"
                >
                  Salir de estudio
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
