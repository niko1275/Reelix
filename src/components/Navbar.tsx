"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, VideoIcon } from "lucide-react"
import { UserButton, SignInButton, useUser, useAuth } from "@clerk/nextjs"
import { SidebarTrigger } from "./ui/sidebar"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import Image from "next/image"


export function Navbar() {
  const { isSignedIn } = useUser()
  const { isLoaded } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "")
  const { user } = useUser()
  const userId = user?.id
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchValue) {
      params.set("search", searchValue)
    } else {
      params.delete("search")
    }
    router.push(`?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-6 gap-4 w-full">
        <SidebarTrigger />
        <Image 
          src={'/images/Reelix.png'} 
          alt="Reelix logo"
          width={120}
          height={40}
        />
        {/* Contenedor de búsqueda */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-sm">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar videos..." 
                className="pl-8"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-full"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
            
          </div>
        </div>

        {/* Notificaciones y sesión */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
          )}

          {isSignedIn && (
            <UserButton afterSignOutUrl="/">
              <UserButton.MenuItems>
                <UserButton.Link
                  href="/studio"
                  label="Studio"
                  labelIcon={
                    <VideoIcon className="h-4 w-4" />
                  }
                />
                  <UserButton.Link
                  href={`/users/${userId}`}
                  label="Ver tu canal"
                  labelIcon={
                    <VideoIcon className="h-4 w-4" />
                  }
                />
              </UserButton.MenuItems>
            </UserButton>

            
          )}
        </div>
      </div>
    </header>
  )
} 