"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { LogOut, Video } from "lucide-react"
import Link from "next/link"
import { UserAvatar } from "../user-avatar/user-avatar"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

export function SidebarStudio() {
  const { user } = useUser()
  const { isCollapsed } = useSidebar()

  return (
    <div className={cn(
      "flex flex-col h-full transition-all duration-300",
      isCollapsed ? "w-16" : "w-64 lg:w-72"
    )}>
      
      <div className="p-4 border-b">
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <UserAvatar imageUrl={user?.imageUrl || ""} name={user?.fullName || ""} />
          {!isCollapsed && (
            <div>
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-sm text-muted-foreground">Studio Creator</p>
            </div>
          )}
        </div>
      </div>

      
      <div className="flex-1 p-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              isCollapsed && "justify-center px-2"
            )}
            asChild
          >
            <Link href="/studio/content">
              <Video className="h-5 w-5" />
              {!isCollapsed && "Content"}
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50",
              isCollapsed && "justify-center px-2"
            )}
            asChild
          >
            <Link href="/">
              <LogOut className="h-5 w-5" />
              {!isCollapsed && "Exit Studio"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 