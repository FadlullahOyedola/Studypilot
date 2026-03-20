import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const protectedRoutes = ['/dashboard', '/profile', '/settings']
const authRoutes = ['/login', '/signup']

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Get token from cookies
    const token = req.cookies.get('sb-access-token')?.value ||
        req.cookies.get('supabase-auth-token')?.value

    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    )
    const isAuthRoute = authRoutes.some(route =>
        pathname.startsWith(route)
    )

    // If trying to access dashboard without token → redirect to login
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    // If logged in and trying to access login/signup → redirect to dashboard
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
