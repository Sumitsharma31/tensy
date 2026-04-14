import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/playground(.*)',
    '/builder(.*)',
    '/game(.*)',
    '/quiz(.*)',
    '/tips(.*)',
    '/translate(.*)',
    '/translate(.*)',
    '/challenges(.*)',
    '/profile(.*)',
    '/api/ai/assistant',
    '/manifest.json',
])

export default clerkMiddleware(async (auth, req) => {
    // Protect all routes except public ones
    if (!isPublicRoute(req)) {
        await auth.protect()
    }
}, {
    clockSkewInMs: 60_000,
})


export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
