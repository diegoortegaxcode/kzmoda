"use server";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type RegisterResult = { error: string } | null;

export async function customerRegisterAction(_prev: RegisterResult, formData: FormData): Promise<RegisterResult> {
  const name = ((formData.get("name") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const phone = ((formData.get("phone") as string) ?? "").trim() || null;
  const password = (formData.get("password") as string) ?? "";
  const confirm = (formData.get("confirm") as string) ?? "";

  if (!name || !email || !password) return { error: "Completa los campos obligatorios." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };

  let customerId: string;
  let customerName: string;

  try {
    const passwordHash = await hashPassword(password);
    const existing = await db.customer.findUnique({ where: { email } });

    if (existing) {
      if (existing.passwordHash) return { error: "Ya existe una cuenta con ese correo." };
      await db.customer.update({
        where: { id: existing.id },
        data: { passwordHash, ...(phone ? { phone } : {}) },
      });
      customerId = existing.id;
      customerName = existing.name;
    } else {
      const created = await db.customer.create({
        data: { name, email, phone, passwordHash, active: true },
      });
      customerId = created.id;
      customerName = name;
    }

    const token = await signJWT({ sub: customerId, email, name: customerName, role: "CLIENTE" });

    const store = await cookies();
    store.set("kmoda_customer", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 28800,
      path: "/",
    });
  } catch {
    return { error: "Error del servidor. Intenta de nuevo en unos momentos." };
  }

  redirect("/cuenta/pedidos");
}
