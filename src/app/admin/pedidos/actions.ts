"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type OrderStatus = "PENDIENTE" | "EN_PROCESO" | "EN_DESPACHO" | "COMPLETADO" | "CANCELADO";

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<{ success?: true; error?: string }> {
  if (!orderId || !status) return { error: "Datos inválidos." };
  try {
    await db.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === "COMPLETADO" ? { deliveredAt: new Date() } : {}),
      },
    });
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el estado." };
  }
}
