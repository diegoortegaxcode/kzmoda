import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { signJWT } from "@/lib/jwt";
import { shouldUseSecureCookie } from "@/lib/auth-cookie";

const SEE_OTHER = { status: 303 } as const;

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const email = ((body.get("email") as string) ?? "").trim().toLowerCase();
  const password = (body.get("password") as string) ?? "";

  if (!email || !password) {
    return NextResponse.redirect(new URL("/cuenta/login?error=campos", req.url), SEE_OTHER);
  }

  const user = await db.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !user.active || !valid) {
    return NextResponse.redirect(new URL("/cuenta/login?error=credenciales", req.url), SEE_OTHER);
  }

  const token = await signJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "ADMIN" | "ASISTENTE",
  });

  const res = NextResponse.redirect(new URL("/admin", req.url), SEE_OTHER);
  res.cookies.set("kmoda_session", token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(req.url),
    sameSite: "lax",
    maxAge: 28800,
    path: "/",
  });
  return res;
}
