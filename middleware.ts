import { NextResponse } from 'next/server'

export function middleware() {
  const res = NextResponse.next()
  // Hii ndiyo inazuia back/forward arrow kuleta page ya zamani kutoka cache
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Expires', '0')
  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}