"use client"

import { NavbarStudio } from "./NavbarStudio"
import MuxUploadContainer from '@/components/studio/MuxUploadContainer'

export default function NavbarStudioSection() {
  return (
    <header className="border-b bg-background shadow-2xl">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <NavbarStudio />
        <MuxUploadContainer />
      </div>
    </header>
  )
}
