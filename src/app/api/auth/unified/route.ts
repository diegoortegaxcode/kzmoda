import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { signJWT } from "@/lib/jwt";
import { shouldUseSecureCookie } from "@/lib/auth-cookie";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const email = ((body.get("email") as string) ?? "").trim().toLowerCase();
  const password = (body.get("password") as string) ?? "";

  if (!email || !password) {
    return NextResponse.redirect(new URL("/cuenta/login?error=campos", req.url));
  }

  // Try admin / asistente first
  const user = await db.user.findUnique({ where: { email } });
  if (user && user.active) {
    const valid = await verifyPassword(password, user.passwordHash);
    if (valid) {
      const token = await signJWT({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role as "ADMIN" | "ASISTENTE",
      });
      const res = NextResponse.redirect(new URL("/admin", req.url));
      res.cookies.set("kmoda_session", token, {
        httpOnly: true,
        secure: shouldUseSecureCookie(req.url),
        sameSite: "lax",
        maxAge: 28800,
        path: "/",
      });
      return res;
    }
  }

  // Try customer
  const customer = await db.customer.findUnique({ where: { email } });
  const hasHash = !!customer?.passwordHash;
  const validCustomer = hasHash
    ? await verifyPassword(password, customer!.passwordHash!)
    : false;

  if (!customer || !customer.active || !hasHash || !validCustomer) {
    return NextResponse.redirect(new URL("/cuenta/login?error=credenciales", req.url));
  }

  const token = await signJWT({
    sub: customer.id,
    email: customer.email!,
    name: customer.name,
    role: "CLIENTE",
  });
  const res = NextResponse.redirect(new URL("/cuenta/pedidos", req.url));
  res.cookies.set("kmoda_customer", token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(req.url),
    sameSite: "lax",
    maxAge: 28800,
    path: "/",
  });
  return res;
}
