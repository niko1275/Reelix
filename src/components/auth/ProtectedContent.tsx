'use client';

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ProtectedContentProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function ProtectedContent({
  title = "No te pierdas los nuevos videos",
  description = "Accede para ver las actualizaciones de tus canales favoritos",
  buttonText = "Acceder"
}: ProtectedContentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h1 className="text-2xl font-bold text-center">{title}</h1>
      <p className="text-muted-foreground text-center max-w-md">
        {description}
      </p>
      <Button asChild>
        <Link href="/api/auth/signin">
          {buttonText}
        </Link>
      </Button>
    </div>
  )
} 