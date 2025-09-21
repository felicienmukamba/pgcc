import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { canAccessModule, type Role } from "@/lib/rbac"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Allow access to auth pages
    if (pathname.startsWith("/auth/")) {
      return NextResponse.next()
    }

    // Require authentication for dashboard
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Check module access permissions
    if (token?.role) {
      const userRole = token.role as Role

      // Extract module from pathname
      const pathSegments = pathname.split("/")
      if (pathSegments[1] === "dashboard" && pathSegments[2]) {
        const module = pathSegments[2]

        // Map routes to modules
        const moduleMap: Record<string, string> = {
          citizens: "citizens",
          consultations: "consultations",
          prescriptions: "prescriptions",
          complaints: "complaints",
          convictions: "convictions",
          biometric: "biometric",
          users: "users",
        }

        const requiredModule = moduleMap[module]
        if (requiredModule && !canAccessModule(userRole, requiredModule)) {
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
}
