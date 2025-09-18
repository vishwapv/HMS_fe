// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Public routes (no auth). Keep only /login so the app stays private.
 * If you really want the root (/) public, add it back here.
 */
const PUBLIC_PATHS = ["/login"];

/**
 * Route groups (prefix-based). Use path *prefixes* here.
 * - Admin: full access (implicitly allowed everywhere).
 * - Receptionist: only reception tools & patient-facing modules.
 * - Pharmacy: only pharmacy area.
 */
const ADMIN_ONLY = [
  "/dashboard/admin",
  "/analytics",
  "/analytics/revenue",
  "/reports",
  "/audit",
  "/beds",
  "/billing",
  "/ipd",
  "/lab",
  "/pacs",
  "/nurses",
  "/staff",
  "/commitments",
];

const RECEPTIONIST_ALLOWED = [
  "/dashboard/reception",
  "/patients",
  "/appointments",
  "/queue",
  "/discharge",
  "/admissions",
  "/opd",
  // reception utilities we added:
  "/reception",          // e.g. /reception/doctors, /reception/payments
  "/doctors",            // if you also mounted it at /doctors
];

const PHARMACY_ALLOWED = [
  "/dashboard/pharmacy",
  "/pharmacy",
];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Returns allowed roles for a given pathname.
 * "*" => any authenticated role.
 */
function allowedRolesFor(pathname: string): "*" | string[] {
  // Strict admin-only areas
  if (startsWithAny(pathname, ADMIN_ONLY)) return ["admin"];

  // Pharmacy area
  if (startsWithAny(pathname, PHARMACY_ALLOWED)) return ["admin", "pharmacy"];

  // Receptionist area
  if (startsWithAny(pathname, RECEPTIONIST_ALLOWED))
    return ["admin", "receptionist"];

  // Root and dashboards fallback:
  if (pathname === "/") return ["admin", "receptionist", "pharmacy"];

  // Default: any authenticated role
  return "*";
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Skip static assets + API routes entirely
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js|map|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Require auth elsewhere
  const role = req.cookies.get("smh_role")?.value || null;
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + (search || ""))}`;
    return NextResponse.redirect(url);
  }

  // Enforce role-based access
  const allowed = allowedRolesFor(pathname);
  if (allowed !== "*" && !allowed.includes(role)) {
    // Not allowed → send to role home
    const url = req.nextUrl.clone();
    url.pathname =
      role === "admin"
        ? "/dashboard/admin"
        : role === "pharmacy"
        ? "/dashboard/pharmacy"
        : "/dashboard/reception";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Run on all pages except static + api (mirrors the early return above).
 */
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
