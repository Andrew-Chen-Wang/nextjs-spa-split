import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/** Public paths handled by Next.js — everything else goes to the dashboard SPA */
const NEXTJS_PUBLIC_PREFIXES = ["/login", "/blog", "/api", "/legal"]

/** Exact public paths */
const NEXTJS_PUBLIC_EXACT = ["/"]

const SPA_ADMIN = {
  prefix: "/admin",
  devPort: 3002,
} as const

const DASHBOARD_DEV_PORT = 3001

function isNextJsRoute(pathname: string): boolean {
  if (NEXTJS_PUBLIC_EXACT.includes(pathname)) return true
  return NEXTJS_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isAssetRequest(pathname: string): boolean {
  if (/\.\w+$/.test(pathname)) return true
  // Vite dev server internal paths
  if (/@vite|@react-refresh|@id|node_modules\/\.vite/.test(pathname)) return true
  return false
}

function handleCsrfAndCookies(request: NextRequest): NextResponse | null {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", request.nextUrl.pathname)

  if (request.method === "GET") {
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    const token = request.cookies.get("session")?.value ?? null
    if (token !== null) {
      response.cookies.set("session", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
    }
    return response
  }

  const originHeader = request.headers.get("Origin")
  const hostHeader = request.headers.get("X-Forwarded-Host") ?? request.headers.get("Host")
  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, { status: 403, headers: requestHeaders })
  }
  let origin: URL
  try {
    origin = new URL(originHeader)
  } catch {
    return new NextResponse(null, { status: 403, headers: requestHeaders })
  }
  if (origin.host !== hostHeader) {
    return new NextResponse(null, { status: 403, headers: requestHeaders })
  }

  return null
}

function rewriteToSpa(
  request: NextRequest,
  pathname: string,
  devPort: number,
  devBasePath: string,
  prodFolder: string,
): NextResponse {
  const isDev = process.env.NODE_ENV === "development"
  const spaOrigin = isDev ? `http://localhost:${devPort}` : "https://d1i66hf38xpie.cloudfront.net"

  const spaUrl = new URL(pathname, spaOrigin)
  spaUrl.search = request.nextUrl.search

  if (!isAssetRequest(pathname)) {
    if (isDev) {
      spaUrl.pathname = `${devBasePath}/`
    } else {
      spaUrl.pathname = `${prodFolder}/index.html`
    }
  }

  return NextResponse.rewrite(spaUrl)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Next.js public routes — pass through with CSRF/cookie handling
  if (isNextJsRoute(pathname)) {
    const csrfResult = handleCsrfAndCookies(request)
    if (csrfResult) return csrfResult
    return NextResponse.next()
  }

  // Admin SPA — requires auth + isAdmin, checked in the SPA via /api/v1/auth/me
  if (pathname === SPA_ADMIN.prefix || pathname.startsWith(`${SPA_ADMIN.prefix}/`)) {
    return rewriteToSpa(request, pathname, SPA_ADMIN.devPort, "/admin", "/admin")
  }

  // Everything else → Dashboard SPA (auth checked in SPA via /api/v1/auth/me)
  return rewriteToSpa(request, pathname, DASHBOARD_DEV_PORT, "", "/dashboard")
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\..*).*)"],
}
