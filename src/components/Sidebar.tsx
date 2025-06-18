"use client"

import {
  useSidebar,
} from "@/components/ui/sidebar"

import { useAuth, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { Home, SquarePlay, Video, History, ThumbsUp,ListVideo, Compass, PlaySquare, Clock, Flame, Music, Film, Newspaper, Trophy, Lightbulb, Gamepad} from "lucide-react"
import SidebarHomeMobile from "./SidebarHomeMobile"


interface SidebarProps {
  isOpen: boolean
}



export function SidebarHome({ isOpen }: SidebarProps) {
  const { user } = useUser()
  const { state , isMobile} = useSidebar()
  const isopen2 = state === "expanded"  ? true : false

  const userId = user?.id
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
          <Link href="/">
          <SidebarItem icon={<Home />} text="Home" isOpen={isopen2} active />
          </Link>
         
          <Link href="/subscriptions">
          <SidebarItem icon={<PlaySquare />} text="Subscriptions" isOpen={isopen2} />
          </Link>
   

       
          <Link href="/playlist">
          <SidebarItem icon={<PlaySquare />} text="Playlists" isOpen={isopen2} />
          </Link>
        </div>
        
        <hr className="border-t my-2" />
        
        {/* Library */}
        <div className="mb-4">
          <Link href="/historial">
            <SidebarItem icon={<Clock />} text="History" isOpen={isopen2} />
          </Link>
         
          <Link href="/studio">
           <SidebarItem icon={<PlaySquare />} text="Tus Videos" isOpen={isopen2} />
          </Link>
          <Link href="/likedvideos">
          <SidebarItem icon={<ThumbsUp />} text="Videos que me gustaron" isOpen={isopen2} />
          </Link>
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

      
      </div>
    </aside>
  )
};



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