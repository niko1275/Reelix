"use server"
import { HydrateClient } from "@/server/server";
import { PlaylistContent } from "@/components/playlist/PlaylistContent";
import { currentUser} from "@clerk/nextjs/server"

import ProtectedContent from "@/components/auth/ProtectedContent";

export default async function PlaylistPage() {
    const userId  = await currentUser();
  if(!userId) {
         return (
            <ProtectedContent
                title="Accede a la sección de Videos que te gustaron"
                description="Inicia sesión para Acceder a la sección de Videos que te gustaron"
                buttonText="Iniciar Sesión"
            />
        )
    }
    return (
        <HydrateClient>
            <PlaylistContent />
        </HydrateClient>
    );
}