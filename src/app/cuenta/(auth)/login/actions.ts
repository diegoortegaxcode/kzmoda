"use server";

import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginResult = null;

export async function customerLoginAction(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) redirect("/cuenta/login?error=campos");

  const customer = await db.customer.findUnique({ where: { email } });
  const hasHash = !!customer?.passwordHash;
  const valid = hasHash ? await verifyPassword(password, customer!.passwordHash!) : false;

  if (!customer || !customer.active || !hasHash || !valid) {
    redirect("/cuenta/login?error=credenciales");
  }

  const token = await signJWT({
    sub: customer.id,
    email: customer.email!,
    name: customer.name,
    role: "CLIENTE",
  });

  const store = await cookies();
  store.set("kmoda_customer", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 28800,
    path: "/",
  });

  redirect("/cuenta/pedidos");
}

export async function customerLogoutAction(): Promise<void> {
  const store = await cookies();
  store.delete("kmoda_customer");
  redirect("/cuenta/login");
}
