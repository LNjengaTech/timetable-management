import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // Skip checks for guest-accessible demo page
        if (path === "/dashboard/demo") {
            return NextResponse.next()
        }

        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.rewrite(new URL('/auth/login', req.url))
        }

        // Lecturers and Admins can access lecturer paths
        if (path.startsWith("/lecturer") && !["ADMIN", "LECTURER"].includes(token?.role as string)) {
            return NextResponse.rewrite(new URL('/auth/login', req.url))
        }

        // Students, Lecturers, and Admins can access dashboard
        // But GUEST (from middleware's perspective, or if we want to force login for other dashboard paths)
        if (path.startsWith("/dashboard") && token?.role === "GUEST") {
            return NextResponse.rewrite(new URL('/auth/login', req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname
                if (path === "/dashboard/demo") return true
                return !!token
            },
        },
    }
)

export const config = {
    matcher: ["/admin/:path*", "/lecturer/:path*", "/dashboard/:path*"],
}
