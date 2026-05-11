"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ActionResult = { success?: true; error?: string } | null;

export type CustomerRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  dni: string | null;
  creditLimit: number;
  active: boolean;
  ordersCount: number;
  debtsCount: number;
};

export async function fetchCustomers(): Promise<CustomerRow[]> {
  const rows = await db.customer.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: { _count: { select: { orders: true, debts: true } } },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((c: any) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    dni: c.dni,
    creditLimit: Number(c.creditLimit),
    active: c.active,
    ordersCount: c._count.orders,
    debtsCount: c._count.debts,
  }));
}

export async function createCustomerAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim() || undefined;
  const phone = (formData.get("phone") as string).trim() || undefined;
  const dni = (formData.get("dni") as string).trim() || undefined;
  const creditLimit = parseFloat(formData.get("creditLimit") as string) || 0;
  const notes = (formData.get("notes") as string).trim() || undefined;

  if (!name) return { error: "El nombre es requerido." };

  try {
    await db.customer.create({ data: { name, email, phone, dni, creditLimit, notes } });
    revalidatePath("/admin/clientes");
    return { success: true };
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") return { error: "Ya existe un cliente con ese email o DNI." };
    return { error: "Error al crear el cliente." };
  }
}

export async function toggleCustomerAction(id: string): Promise<void> {
  const current = await db.customer.findUnique({ where: { id }, select: { active: true } });
  await db.customer.update({ where: { id }, data: { active: !current?.active } });
  revalidatePath("/admin/clientes");
}
