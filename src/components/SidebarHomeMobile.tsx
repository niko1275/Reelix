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
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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

function SubscriptionItem({ name, imageUrl, isOpen }: { 
  name: string; 
  imageUrl: string;
  isOpen: boolean;
}) {
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
      {isOpen && <span className="text-sm">{name}</span>}
    </div>
  );
}

export default function SidebarHomeMobile() {
  const { state } = useSidebar()
  const pathname = usePathname();
  const { data: subscriptions } = trpc.subscriptions.getUserSubscriptions.useQuery();
  
  // Estado para detectar si estamos en mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // En mobile, siempre mostrar expandido. En desktop, usar el estado de la sidebar
  const shouldShowText = isMobile ? true : state === "expanded";

  return (
    <Sidebar className="border-r overflow-hidden">
      <SidebarContent className="p-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold mb-6" />
          <SidebarGroupContent>
            <SidebarMenu className="">
              {/* Logo - solo mostrar en mobile expandido o desktop expandido */}
              {shouldShowText && (
                <Image
                  src={'/images/Reelix.png'}
                  alt="Reelix logo"
                  width={120}
                  height={40}
                  className="mx-auto sm:mx-0 mb-4"
                />
              )}
              
              <Link href="/" className="">
                <SidebarItem 
                  icon={<Home />} 
                  text="Home" 
                  isOpen={shouldShowText}  
                  active={pathname === '/'} 
                />
              </Link>
              
              <Link href="/playlist">
                <SidebarItem 
                  icon={<PlaySquare />} 
                  text="Playlists" 
                  isOpen={shouldShowText}   
                  active={pathname === '/playlist'} 
                />
              </Link>
              
              <Link href="/historial">
                <SidebarItem 
                  icon={<HistoryIcon />} 
                  text="Historial" 
                  isOpen={shouldShowText} 
                  active={pathname === '/historial'}
                />
              </Link>
              
              <Link href="/likedvideos">
                <SidebarItem 
                  icon={<ThumbsUp />} 
                  text="Videos que me gustaron" 
                  isOpen={shouldShowText} 
                  active={pathname === '/likedvideos'}
                />
              </Link>
            </SidebarMenu>
            
            {/* Subscriptions */}
            {subscriptions && subscriptions.length > 0 && (
              <div className="mt-8">
                {shouldShowText && (
                  <h3 className="text-sm font-medium mb-2 px-2">SUSCRIPCIONES</h3>
                )}
                {subscriptions.map(sub => (
                  <SubscriptionItem 
                    key={sub.id} 
                    name={sub.name} 
                    imageUrl={sub.imageUrl}
                    isOpen={shouldShowText}
                  />
                ))}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}