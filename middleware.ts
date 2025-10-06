import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Update session
  const { response, supabase } = await updateSession(request)

  // Get pathname
  const pathname = request.nextUrl.pathname

  // Public routes that don't need auth
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Store routes (public)
  const isStoreRoute = pathname.startsWith('/') && !pathname.startsWith('/dashboard')

  // Auth routes
  const isAuthRoute = ['/login', '/signup'].includes(pathname)

  // Protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/onboarding')

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}