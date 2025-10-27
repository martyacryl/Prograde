import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Don't protect auth routes
  if (path === '/login' || path === '/signup' || path.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // For now, let all routes through - authentication will be handled client-side
  // This allows the login page to load without server-side auth checks
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
