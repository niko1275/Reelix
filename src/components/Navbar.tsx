"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserButton, SignInButton, useUser, useAuth } from "@clerk/nextjs"

export function Navbar() {
  const { isSignedIn } = useUser()
  const { isLoaded } = useAuth()

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-6 gap-4">
        <div className="flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
          )}
          {isSignedIn && <UserButton afterSignOutUrl="/" />}
        </div>
      </div>
    </header>
  )
} 