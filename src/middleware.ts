import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

const CUSTOMER_PUBLIC = ["/cuenta/login", "/cuenta/registro"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("kmoda_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    const session = await verifyJWT(token);
    if (!session || session.role === "CLIENTE") {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("kmoda_session");
      return res;
    }
    return NextResponse.next();
  }

  // ── Customer portal routes ────────────────────────────────────────────────
  if (pathname.startsWith("/cuenta")) {
    if (CUSTOMER_PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
    const token = req.cookies.get("kmoda_customer")?.value;
    if (!token) return NextResponse.redirect(new URL("/cuenta/login", req.url));
    const session = await verifyJWT(token);
    if (!session || session.role !== "CLIENTE") {
      const res = NextResponse.redirect(new URL("/cuenta/login", req.url));
      res.cookies.delete("kmoda_customer");
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};
