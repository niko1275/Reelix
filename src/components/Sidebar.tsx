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

import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { Home, SquarePlay, Video, History, ThumbsUp,ListVideo, Compass, PlaySquare, Clock, Flame, Music, Film, Newspaper, Trophy, Lightbulb, Gamepad} from "lucide-react"
import clsx from "clsx"
import SidebarHomeMobile from "./SidebarHomeMobile"
import { Separator } from "./ui/separator"

interface SidebarProps {
  isOpen: boolean
}

export function SidebarHome({ isOpen }: SidebarProps) {
  const { user } = useUser()
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

 
 

  if (isMobile) return <SidebarHomeMobile />

  return  (
    <aside className={`${isopen2 ? "w-64" : "w-20"} h-[calc(100vh-60px)]  top-[60px] bg-background border-r overflow-y-auto transition-all duration-300 `}>
      <div className={`py-2 ${isopen2 ? "px-4" : "px-2"}`}>
        {/* Main Navigation */}
        <div className="mb-4">
          <SidebarItem icon={<Home />} text="Home" isOpen={isopen2} active />
          <Link href="/subscriptions">
          <SidebarItem icon={<PlaySquare />} text="Subscriptions" isOpen={isopen2} />
          </Link>
   
        </div>
        
        <hr className="border-t my-2" />
        
        {/* Library */}
        <div className="mb-4">
          <SidebarItem icon={<PlaySquare />} text="Library" isOpen={isopen2} />
          <SidebarItem icon={<Clock />} text="History" isOpen={isopen2} />
          <SidebarItem icon={<PlaySquare />} text="Your Videos" isOpen={isopen2} />
          <SidebarItem icon={<Clock />} text="Watch Later" isOpen={isopen2} />
          <SidebarItem icon={<ThumbsUp />} text="Liked Videos" isOpen={isopen2} />
        </div>
        
        <hr className="border-t my-2" />
        
        {/* Subscriptions */}
        {isopen2 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 px-4">SUBSCRIPTIONS</h3>
            <SubscriptionItem name="MrBeast" imageUrl="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
            <SubscriptionItem name="MKBHD" imageUrl="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
            <SubscriptionItem name="Veritasium" imageUrl="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
            <SubscriptionItem name="Kurzgesagt" imageUrl="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
            <SubscriptionItem name="TED" imageUrl="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" />
          </div>
        )}

        <hr className="border-t my-2" />
        
        {/* Explore */}
        <div className="mb-4">
          <h3 className={`text-sm font-medium mb-2 ${isopen2 ? "px-4" : "sr-only"}`}>EXPLORE</h3>
          <SidebarItem icon={<Flame />} text="Trending" isOpen={isopen2} />
          <SidebarItem icon={<Music />} text="Music" isOpen={isopen2} />
          <SidebarItem icon={<Film />} text="Movies & TV" isOpen={isopen2} />
          <SidebarItem icon={<Newspaper />} text="News" isOpen={isopen2} />
          <SidebarItem icon={<Gamepad/>} text="Gaming" isOpen={isopen2} />
          <SidebarItem icon={<Trophy />} text="Sports" isOpen={isopen2} />
          <SidebarItem icon={<Lightbulb />} text="Learning" isOpen={isopen2} />
        </div>

        <hr className="border-t my-2" />
        
        {/* Footer */}
        {isopen2 && (
          <div className="text-xs text-muted-foreground pt-2 px-4 pb-4">
            <div className="flex flex-wrap gap-x-2 mb-2">
              <Link href="#\" className="hover:underline">About</Link>
              <Link href="#" className="hover:underline">Press</Link>
              <Link href="#" className="hover:underline">Copyright</Link>
              <Link href="#" className="hover:underline">Contact</Link>
              <Link href="#" className="hover:underline">Creators</Link>
            </div>
            <div className="flex flex-wrap gap-x-2 mb-2">
              <Link href="#" className="hover:underline">Terms</Link>
              <Link href="#" className="hover:underline">Privacy</Link>
              <Link href="#" className="hover:underline">Policy & Safety</Link>
            </div>
            <p className="mt-4">© 2025 YouTube Clone</p>
          </div>
        )}
      </div>
    </aside>
  )
};



function SidebarItem({ icon, text, isOpen, active = false }: { icon: React.ReactNode, text: string, isOpen: boolean, active?: boolean }) {
  return (
    <Link href="#" className={`flex items-center py-2 px-3 rounded-lg ${active ? "bg-secondary" : "hover:bg-secondary"} transition-colors mb-1`}>
      <span className="text-lg">{icon}</span>
      {isOpen && <span className="ml-4">{text}</span>}
    </Link>
  )
}

function SubscriptionItem({ name, imageUrl }: { name: string, imageUrl: string }) {
  return (
    <Link href="#" className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg transition-colors mb-1">
      <div className="h-6 w-6 rounded-full overflow-hidden">
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      </div>
      <span className="ml-4 text-sm">{name}</span>
    </Link>
  )
}