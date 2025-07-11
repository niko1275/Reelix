"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar"


import Link from "next/link"
import { Home, ThumbsUp, PlaySquare, HistoryIcon } from "lucide-react"

import { trpc } from "@/utils/trpc";
import Image from "next/image";


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

function SubscriptionItem({ name, imageUrl }: { name: string; imageUrl: string }) {
  return (
    <div className="flex items-center py-2 px-3 rounded-lg hover:bg-secondary transition-colors">
      <div className="w-8 h-8 rounded-full mr-3 relative">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover rounded-full"
        />
      </div>
      <span className="text-sm">{name}</span>
    </div>
  );
}

export default function SidebarHomeMobile() {
    const { state } = useSidebar()
    const isopen2 = state === "expanded"  ? true : false

    const { data: subscriptions } = trpc.subscriptions.getUserSubscriptions.useQuery();

    return(
<Sidebar className="border-r overflow-hidden">
      <SidebarContent className="p-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold mb-6" />
          <SidebarGroupContent>
            <SidebarMenu className="space-y-8">
           

            <Link href="/">
          <SidebarItem icon={<Home />} text="Home" isOpen={isopen2} active />
          </Link>
         
          <Link href="/subscriptions">
          <SidebarItem icon={<PlaySquare />} text="Subscriptions" isOpen={isopen2} />
          </Link>
   

       
          <Link href="/playlist">
          <SidebarItem icon={<PlaySquare />} text="Playlists" isOpen={isopen2} />
          </Link>

          <Link href="/historial">
          <SidebarItem icon={<HistoryIcon />} text="Historial" isOpen={isopen2} />
          </Link>

          <Link href="/likedvideos">
          <SidebarItem icon={<ThumbsUp />} text="Videos que me gustaron" isOpen={isopen2} />
          </Link>

            </SidebarMenu>
            {/* Subscriptions */}
            {subscriptions && subscriptions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-2 px-2">SUSCRIPCIONES</h3>
                {subscriptions.map(sub => (
                  <SubscriptionItem key={sub.id} name={sub.name} imageUrl={sub.imageUrl} />
                ))}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
)}