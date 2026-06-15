"use server";

import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginResult = { error: string } | null;

export async function loginAction(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) redirect("/login?error=campos");

  const user = await db.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !user.active || !valid) redirect("/login?error=credenciales");

  const token = await signJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "ADMIN" | "ASISTENTE",
  });

  const store = await cookies();
  store.set("kmoda_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 28800,
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete("kmoda_session");
  redirect("/login");
}
