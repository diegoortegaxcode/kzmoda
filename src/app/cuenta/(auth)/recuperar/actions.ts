"use server";

import { db } from "@/lib/db";
import { headers } from "next/headers";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";

export type RecoverResult = { error: string } | { ok: true } | null;

async function baseUrl(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function customerRecoverAction(_prev: RecoverResult, formData: FormData): Promise<RecoverResult> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  if (!email) return { error: "Ingresa tu correo electrónico." };

  try {
    // El login es unificado: puede ser un admin/asistente (User) o un cliente (Customer).
    // Se prioriza User, igual que en /api/auth/unified. No revelamos el resultado.
    const user = await db.user.findUnique({ where: { email } });

    let target:
      | { name: string; email: string; where: { userId: string } | { customerId: string } }
      | null = null;

    if (user && user.active && user.passwordHash) {
      target = { name: user.name, email: user.email, where: { userId: user.id } };
    } else {
      const customer = await db.customer.findUnique({ where: { email } });
      if (customer && customer.active && customer.passwordHash && customer.email) {
        target = { name: customer.name, email: customer.email, where: { customerId: customer.id } };
      }
    }

    if (target) {
      const { token, tokenHash } = generateResetToken();

      // Invalida tokens anteriores sin usar del mismo titular.
      await db.passwordResetToken.deleteMany({ where: { ...target.where, usedAt: null } });

      await db.passwordResetToken.create({
        data: {
          ...target.where,
          tokenHash,
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${await baseUrl()}/cuenta/restablecer?token=${token}`;
      await sendPasswordResetEmail(target.email, target.name, resetUrl);
    }
  } catch (err) {
    console.error("[recuperar] error:", err);
    return { error: "No pudimos enviar el correo. Intenta de nuevo en unos momentos." };
  }

  return { ok: true };
}
