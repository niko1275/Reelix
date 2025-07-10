import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/explore',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/trpc(.*)',
  "/studio/(.*)",
  '/api/videos/webhook(.*)',
  '/api/videos/status/(.*)',
  '/api/videos/update-from-mux(.*)',
  '/api/mux/get-asset-by-upload/(.*)',
  '/videos/(.*)',
]);

export default clerkMiddleware((auth, req) => {
 
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 