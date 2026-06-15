"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { hashPassword, verifyPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";

export type ActionResult = { success?: true; error?: string } | null;

async function requireAdmin() {
  const store = await cookies();
  const token = store.get("kmoda_session")?.value;
  if (!token) return null;
  const session = await verifyJWT(token);
  if (session?.role !== "ADMIN") return null;
  return session.sub;
}

async function getOrCreateSettings() {
  return db.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

export async function fetchSettings() {
  return getOrCreateSettings();
}

export async function addSkuPrefixAction(prefix: string): Promise<ActionResult> {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Sin autorización." };
  const clean = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!clean || clean.length < 2 || clean.length > 6) return { error: "Prefijo inválido (2-6 letras/números)." };
  const settings = await getOrCreateSettings();
  if (settings.skuPrefixes.includes(clean)) return { error: "El prefijo ya existe." };
  await db.storeSettings.update({ where: { id: "singleton" }, data: { skuPrefixes: [...settings.skuPrefixes, clean] } });
  revalidatePath("/admin/configuracion");
  return { success: true };
}

export async function removeSkuPrefixAction(prefix: string): Promise<ActionResult> {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Sin autorización." };
  const settings = await getOrCreateSettings();
  await db.storeSettings.update({ where: { id: "singleton" }, data: { skuPrefixes: settings.skuPrefixes.filter((p) => p !== prefix) } });
  revalidatePath("/admin/configuracion");
  return { success: true };
}

export async function updateStoreAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Sin autorización." };

  const name     = ((formData.get("name") as string) ?? "").trim();
  const whatsapp = ((formData.get("whatsapp") as string) ?? "").trim();
  const address  = ((formData.get("address") as string) ?? "").trim();
  const instagram = ((formData.get("instagram") as string) ?? "").trim();
  const catalogTagline = ((formData.get("catalogTagline") as string) ?? "").trim();

  if (!name) return { error: "El nombre de la tienda es requerido." };
  if (!whatsapp) return { error: "El número de WhatsApp es requerido." };

  try {
    await db.storeSettings.upsert({
      where: { id: "singleton" },
      update: { name, whatsapp, address, instagram, catalogTagline },
      create: { id: "singleton", name, whatsapp, address, instagram, catalogTagline },
    });
    revalidatePath("/admin/configuracion");
    return { success: true };
  } catch {
    return { error: "Error al guardar la configuración." };
  }
}

export async function changePasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Sin autorización." };

  const current  = (formData.get("current") as string) ?? "";
  const next     = (formData.get("next") as string) ?? "";
  const confirm  = (formData.get("confirm") as string) ?? "";

  if (!current || !next || !confirm) return { error: "Completa todos los campos." };
  if (next.length < 6) return { error: "La nueva contraseña debe tener al menos 6 caracteres." };
  if (next !== confirm) return { error: "Las contraseñas no coinciden." };

  try {
    const user = await db.user.findUnique({ where: { id: adminId }, select: { passwordHash: true } });
    if (!user) return { error: "Usuario no encontrado." };

    const valid = await verifyPassword(current, user.passwordHash);
    if (!valid) return { error: "La contraseña actual es incorrecta." };

    const passwordHash = await hashPassword(next);
    await db.user.update({ where: { id: adminId }, data: { passwordHash } });
    return { success: true };
  } catch {
    return { error: "Error al cambiar la contraseña." };
  }
}
