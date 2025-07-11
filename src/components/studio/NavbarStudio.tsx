"use client"

import { Button } from "@/components/ui/button"

import { UserButton, SignInButton, useUser, useAuth } from "@clerk/nextjs"


import Link from "next/link"
import Image from "next/image"
import { SidebarTrigger } from "../ui/sidebar"

export function NavbarStudio() {
  const { isSignedIn } = useUser()
  const { isLoaded } = useAuth()
 

  return (
   <>
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

        <div>
          <SidebarTrigger/>
        </div>

        <div className="flex items-center gap-4">
       
        

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
 </>
  )
} 