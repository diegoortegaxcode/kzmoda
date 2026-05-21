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

export interface OrderItemInput {
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  customerId: string;
  items: OrderItemInput[];
  paymentType: string;
  discount: number;
  paidAmount?: number;
  dueDate?: string;
  notes?: string;
}

export async function createOrderAction(
  data: CreateOrderInput
): Promise<{ success?: true; orderId?: string; error?: string }> {
  const userId = await getAdminUserId();
  if (!userId) return { error: "Sin autorización." };

  if (!data.customerId) return { error: "Selecciona un cliente." };
  if (!data.items.length) return { error: "Agrega al menos un producto." };
  if (data.items.some((i) => i.qty <= 0)) return { error: "Las cantidades deben ser mayores a 0." };
  if (data.items.some((i) => i.unitPrice < 0)) return { error: "Los precios no pueden ser negativos." };

  try {
    const products = await db.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) } },
      select: { id: true, stock: true, name: true },
    });

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return { error: "Producto no encontrado." };
      if (product.stock < item.qty)
        return { error: `Stock insuficiente para "${product.name}" (disponible: ${product.stock}).` };
    }

    const subtotal = data.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const discount = Math.min(Math.max(data.discount || 0, 0), subtotal);
    const total = subtotal - discount;
    const safePaidAmount = Math.max(0, Number(data.paidAmount || 0));
    const paidAmount = Math.min(safePaidAmount, total);
    const pendingAmount = Math.max(total - paidAmount, 0);
    const hasDebt = pendingAmount > 0.009;
    const isCredit = data.paymentType === "CREDITO";

    if (hasDebt && isCredit && !data.dueDate) {
      return { error: "Selecciona una fecha de vencimiento para el saldo pendiente." };
    }

    const order = await db.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId: data.customerId,
          userId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paymentType: data.paymentType as any,
          status: "PENDIENTE",
          subtotal,
          discount,
          total,
          paidAmount,
          notes: data.notes || null,
          items: {
            create: data.items.map((i) => ({
              productId: i.productId,
              qty: i.qty,
              unitPrice: i.unitPrice,
              subtotal: i.qty * i.unitPrice,
            })),
          },
        },
      });

      for (const item of data.items) {
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
            notes: `Pedido #${order.id.slice(-6).toUpperCase()}`,
          },
        });
      }

      if (hasDebt) {
        await tx.debt.create({
          data: {
            customerId: data.customerId,
            orderId: order.id,
            amount: total,
            amountPaid: paidAmount,
            status: paidAmount > 0 ? "PARCIAL" : "PENDIENTE",
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
          },
        });
      }

      return order;
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/deudas");
    revalidatePath("/admin");
    return { success: true, orderId: order.id };
  } catch {
    return { error: "Error al crear el pedido. Intenta de nuevo." };
  }
}
