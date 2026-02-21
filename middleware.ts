import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.rewrite(new URL('/auth/login', req.url))
        }

        // Lecturers and Admins can access lecturer paths
        if (path.startsWith("/lecturer") && !["ADMIN", "LECTURER"].includes(token?.role as string)) {
            return NextResponse.rewrite(new URL('/auth/login', req.url))
        }

        // Students, Lecturers, and Admins can access dashboard
        if (path.startsWith("/dashboard") && token?.role === "GUEST") {
            return NextResponse.rewrite(new URL('/auth/login', req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: ["/admin/:path*", "/lecturer/:path*", "/dashboard/:path*"],
}
