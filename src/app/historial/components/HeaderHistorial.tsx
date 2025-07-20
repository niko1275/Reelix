import { SidebarTrigger } from '@/components/ui/sidebar'
import Image from 'next/image'
import React from 'react'

interface HeaderHistorialProps {
  title: string;
}


export const HeaderHistorial:React.FC<HeaderHistorialProps> = ({title}) => {
  return (
    <div>
        
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 border-b">
                {/* Logo y sidebar */}
                <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
                  <SidebarTrigger />
                  <Image 
                    src={'/images/Reelix.png'} 
                    alt="Reelix logo"
                    width={120}
                    height={40}
                    className="mx-auto sm:mx-0"
                  />
                </div>
                {/* Título y contador */}
                <div className="flex flex-col items-center flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900 text-center">{title}</h1>
                   
                  </div>
                </div>
                {/* Botones de usuario y limpiar */}
               
              </div>
       
    </div>
  )
}
