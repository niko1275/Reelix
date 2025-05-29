"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserButton, SignInButton, useUser, useAuth } from "@clerk/nextjs"
import { useState } from "react"
import { SidebarStudio } from "./StudioSidebar"
import Link from "next/link"
import Image from "next/image"
import { useSidebar } from "@/contexts/sidebar-context"
import { NavbarCargarModal } from "./NavbarCargarModal"

export function NavbarStudio() {
  const { isSignedIn } = useUser()
  const { isLoaded } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { isCollapsed, toggleSidebar } = useSidebar()

  return (
    <header className="border-b bg-background shadow-2xl">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
     
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Botón para colapsar/expandir sidebar en desktop */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>

        <div className="flex-1">
          <div className="p-6">
            <Link href="/studio" className="flex items-center space-x-2">
              <Image
                src="/images/Reelix.png"
                alt="Reelix Logo"
                width={120}
                height={40}
                className="object-contain"
              /> 
              <span className="text-xl font-bold">Studio</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
       
          <NavbarCargarModal />

          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
          )}
          {isSignedIn && (
            <UserButton afterSignOutUrl="/">
              <UserButton.MenuItems>
                <UserButton.Link href="/studio" label="Studio" labelIcon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video-icon lucide-video"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>}/>
              </UserButton.MenuItems>
            </UserButton>
          )}
        </div>
      </div>

     
      <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className={`fixed inset-y-0 left-0 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4">
            <SidebarStudio />
          </div>
        </div>
      </div>
    </header>
  )
} 