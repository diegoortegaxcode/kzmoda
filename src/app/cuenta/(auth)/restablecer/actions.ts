"use server";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { hashResetToken } from "@/lib/reset-token";
import { redirect } from "next/navigation";

export type ResetResult = { error: string } | null;

export async function customerResetAction(_prev: ResetResult, formData: FormData): Promise<ResetResult> {
  const token = ((formData.get("token") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const confirm = (formData.get("confirm") as string) ?? "";

  if (!token) return { error: "Enlace inválido. Solicita uno nuevo." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };

  try {
    const record = await db.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return { error: "El enlace expiró o ya fue usado. Solicita uno nuevo." };
    }

    const passwordHash = await hashPassword(password);

    const updatePrincipal = record.userId
      ? db.user.update({ where: { id: record.userId }, data: { passwordHash } })
      : db.customer.update({ where: { id: record.customerId! }, data: { passwordHash } });

    await db.$transaction([
      updatePrincipal,
      db.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
  } catch (err) {
    console.error("[restablecer] error:", err);
    return { error: "Error del servidor. Intenta de nuevo en unos momentos." };
  }

  redirect("/cuenta/login?reset=ok");
}
