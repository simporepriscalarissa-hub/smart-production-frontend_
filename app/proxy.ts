import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const pagesPubliques = ['/login', '/rfid-login']
  if (pagesPubliques.includes(pathname)) return NextResponse.next()

  if (pathname.startsWith('/operateur')) {
    if (!token) return NextResponse.redirect(new URL('/rfid-login', request.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/operateur/:path*'],
}