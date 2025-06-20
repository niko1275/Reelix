import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware

const isPublicRoute = createRouteMatcher([
  '/',
  '/explore',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);



export default clerkMiddleware((auth, req) => {  
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

// Configuración específica para rutas de API
export const config = {
  matcher: [
    // Excluir archivos internos de Next.js y archivos estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Incluir siempre api routes
    '/(api|trpc)(.*)',
  ],
}