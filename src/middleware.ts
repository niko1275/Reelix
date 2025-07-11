import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/studio(.*)',
  // Agrega otras rutas protegidas aquí
]);

export default clerkMiddleware(async (auth, req) => {
  // Excluir rutas de upload de la protección
  if (req.nextUrl.pathname.includes('/upload')) {
    return NextResponse.next();
  }

  // Aplicar protección solo a rutas específicas
  if (isProtectedRoute(req)) {
    
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Excluir archivos estáticos y _next
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Incluir siempre api y trpc
    '/(api|trpc)(.*)',
  ],
};