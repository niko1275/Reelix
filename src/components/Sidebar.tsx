"use client"

import {
  useSidebar,
} from "@/components/ui/sidebar"

import Link from "next/link"
import { Home, ThumbsUp,PlaySquare, Clock} from "lucide-react"
import SidebarHomeMobile from "./SidebarHomeMobile"

import { trpc } from "@/utils/trpc";
import { Image } from "@/components/ui/image";

interface SidebarProps {
  isOpen: boolean
}

export function SidebarHome({ }: SidebarProps) {

  const { state , isMobile} = useSidebar()
  const isopen2 = state === "expanded"  ? true : false

  const { data: subscriptions } = trpc.subscriptions.getUserSubscriptions.useQuery();
  console.log('Subscriptions:', subscriptions);

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
         
         
          <Link href="/likedvideos">
          <SidebarItem icon={<ThumbsUp />} text="Videos que me gustaron" isOpen={isopen2} />
          </Link>
        </div>
        
        <hr className="border-t my-2" />
        
        {/* Subscriptions */}
        {isopen2 && subscriptions && subscriptions.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 px-4">SUSCRIPCIONES</h3>
            {subscriptions.map(sub => (
              <SubscriptionItem key={sub.id} name={sub.name} imageUrl={sub.imageUrl} />
            ))}
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
      <div className="h-6 w-6 rounded-full overflow-hidden relative">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover rounded-full"
        />
      </div>
      <span className="ml-4 text-sm">{name}</span>
    </Link>
  )
}