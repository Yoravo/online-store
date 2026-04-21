import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/src/lib/auth'

const AUTH_ROUTES = ['/login', '/register']
const SELLER_ROUTES = ['/dashboard']
const ADMIN_ROUTES = ['/admin']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value
  const user = token ? await verifyToken(token) : null

  // Kalau sudah login, tidak bisa akses login/register
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    if (user) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Kalau belum login, redirect ke login
  if (!user) {
    const isPublic = pathname === '/'
    if (!isPublic) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  // Proteksi dashboard, hanya SELLER & ADMIN
  if (SELLER_ROUTES.some(route => pathname.startsWith(route))) {
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Proteksi admin — hanya ADMIN
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}