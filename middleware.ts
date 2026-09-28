import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname === '/admin/login'

  // supabase huweka cookie yenye 'auth-token'
  const hasAuth = req.cookies.getAll().some(c => c.name.includes('auth-token') && c.value)

  if (isAdminRoute &&!isLoginRoute &&!hasAuth) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  if (isLoginRoute && hasAuth) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}