"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { revalidatePath } from "next/cache";

async function getAdminUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get("kmoda_session")?.value;
  if (!token) return null;
  const session = await verifyJWT(token);
  if (!session || session.role === "CLIENTE") return null;
  return session.sub;
}

export interface UpdateOrderInput {
  items: { productId: string; qty: number; unitPrice: number }[];
  discount: number;
  paymentType: string;
  notes?: string;
  dueDate?: string;
}

export async function updateOrderAction(
  orderId: string,
  data: UpdateOrderInput
): Promise<{ success?: true; error?: string }> {
  const userId = await getAdminUserId();
  if (!userId) return { error: "Sin autorización." };
  if (!data.items.length) return { error: "Agrega al menos un producto." };
  if (data.items.some((i) => i.qty <= 0)) return { error: "Las cantidades deben ser mayores a 0." };
  if (data.items.some((i) => i.unitPrice < 0)) return { error: "Los precios no pueden ser negativos." };

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        debt: { select: { id: true, amountPaid: true, dueDate: true } },
      },
    });
    if (!order) return { error: "Pedido no encontrado." };

    // Build map of old quantities to restore stock
    const oldQtyMap = new Map<string, number>();
    for (const item of order.items) {
      oldQtyMap.set(item.productId, (oldQtyMap.get(item.productId) ?? 0) + item.qty);
    }

    // Fetch products for new items
    const newProductIds = data.items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: newProductIds } },
      select: { id: true, stock: true, name: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Check stock: effective stock = currentStock + what we'll restore for that product
    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) return { error: "Producto no encontrado." };
      const restored = oldQtyMap.get(item.productId) ?? 0;
      const effective = product.stock + restored;
      if (effective < item.qty) {
        return { error: `Stock insuficiente para "${product.name}" (disponible: ${effective}).` };
      }
    }

    const subtotal = data.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const discount = Math.min(Math.max(data.discount || 0, 0), subtotal);
    const total = subtotal - discount;

    // If there's a debt with existing payments, new total must cover them
    if (order.debt && Number(order.debt.amountPaid) > total + 0.001) {
      return {
        error: `El nuevo total (S/ ${total.toFixed(2)}) no puede ser menor que lo ya pagado (S/ ${Number(order.debt.amountPaid).toFixed(2)}).`,
      };
    }

    const shortId = orderId.slice(-6).toUpperCase();

    await db.$transaction(async (tx) => {
      // 1. Restore stock for all old items
      for (const [productId, qty] of oldQtyMap) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { increment: qty } },
        });
        await tx.stockMovement.create({
          data: {
            productId,
            userId,
            type: "AJUSTE",
            qty,
            notes: `Edición pedido #${shortId} — devolución`,
          },
        });
      }

      // 2. Delete old items
      await tx.orderItem.deleteMany({ where: { orderId } });

      // 3. Create new items and deduct stock
      for (const item of data.items) {
        await tx.orderItem.create({
          data: {
            orderId,
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            subtotal: item.qty * item.unitPrice,
          },
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId,
            type: "SALIDA",
            qty: item.qty,
            notes: `Pedido #${shortId} (editado)`,
          },
        });
      }

      // 4. Update order
      await tx.order.update({
        where: { id: orderId },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paymentType: data.paymentType as any,
          subtotal,
          discount,
          total,
          notes: data.notes || null,
        },
      });

      // 5. Update debt if exists
      if (order.debt) {
        const amountPaid = Number(order.debt.amountPaid);
        const remaining = total - amountPaid;
        const newStatus =
          remaining <= 0.001 ? "PAGADO" : amountPaid > 0 ? "PARCIAL" : "PENDIENTE";
        await tx.debt.update({
          where: { id: order.debt.id },
          data: {
            amount: total,
            status: newStatus,
            dueDate: data.dueDate ? new Date(data.dueDate) : order.debt.dueDate,
          },
        });
      }
    });

    revalidatePath(`/admin/pedidos/${orderId}`);
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/deudas");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Error al actualizar el pedido. Intenta de nuevo." };
  }
}
