"use server";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { revalidatePath } from "next/cache";

export type ActionResult = { success?: true; error?: string } | null;

async function requireAdmin(): Promise<string | null> {
  const store = await cookies();
  const token = store.get("kmoda_session")?.value;
  if (!token) return null;
  const session = await verifyJWT(token);
  if (session?.role !== "ADMIN") return null;
  return session.sub;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ASISTENTE";
  active: boolean;
  createdAt: string;
}

export async function fetchUsers(): Promise<UserRow[]> {
  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });
  return users.map((u) => ({ ...u, role: u.role as "ADMIN" | "ASISTENTE", createdAt: u.createdAt.toISOString() }));
}

export async function createUserAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Solo los administradores pueden crear usuarios." };

  const name = ((formData.get("name") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";
  const role = (formData.get("role") as string) === "ADMIN" ? "ADMIN" : "ASISTENTE";

  if (!name || !email || !password) return { error: "Completa todos los campos." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };

  try {
    const exists = await db.user.findUnique({ where: { email } });
    if (exists) return { error: "Ya existe un usuario con ese correo." };

    const passwordHash = await hashPassword(password);
    await db.user.create({ data: { name, email, passwordHash, role } });
    revalidatePath("/admin/asistentes");
    return { success: true };
  } catch {
    return { error: "Error al crear el usuario." };
  }
}

export async function toggleUserAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Sin autorización." };

  const userId = formData.get("userId") as string;
  if (userId === adminId) return { error: "No puedes desactivar tu propia cuenta." };

  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { active: true } });
    if (!user) return { error: "Usuario no encontrado." };
    await db.user.update({ where: { id: userId }, data: { active: !user.active } });
    revalidatePath("/admin/asistentes");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el usuario." };
  }
}
