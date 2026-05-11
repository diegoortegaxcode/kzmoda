"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
type StockMovementType = "ENTRADA" | "SALIDA" | "AJUSTE" | "DEVOLUCION";

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
  costPrice: number;
  active: boolean;
  category: string;
};

export type CategoryOption = { id: string; name: string };

export type ActionResult = { success?: true; error?: string } | null;

async function getActingUserId(): Promise<string> {
  const store = await cookies();
  const fromCookie = store.get("kmoda_user_id")?.value;
  if (fromCookie) return fromCookie;
  const user = await db.user.findFirst({ where: { active: true } });
  if (!user) throw new Error("No hay usuarios registrados en el sistema.");
  return user.id;
}

export async function fetchInventario() {
  const [rawProducts, categories] = await Promise.all([
    db.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    db.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: ProductRow[] = rawProducts.map((p: any) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    stock: p.stock,
    minStock: p.minStock,
    price: Number(p.price),
    costPrice: Number(p.costPrice),
    active: p.active,
    category: p.category.name,
  }));

  return { products, categories };
}

export async function createProductAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string).trim();
  const sku = (formData.get("sku") as string).trim().toUpperCase();
  const categoryId = formData.get("categoryId") as string;
  const price = parseFloat(formData.get("price") as string);
  const costPrice = parseFloat(formData.get("costPrice") as string);
  const stock = parseInt(formData.get("stock") as string) || 0;
  const minStock = parseInt(formData.get("minStock") as string) || 5;
  const description = ((formData.get("description") as string) || "").trim() || undefined;

  if (!name || !sku || !categoryId || isNaN(price) || isNaN(costPrice)) {
    return { error: "Completa todos los campos requeridos." };
  }
  if (price <= 0 || costPrice <= 0) {
    return { error: "Los precios deben ser mayores a 0." };
  }

  try {
    await db.product.create({
      data: { name, sku, categoryId, price, costPrice, stock, minStock, description },
    });
    revalidatePath("/admin/inventario");
    return { success: true };
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") return { error: "El SKU ya existe." };
    return { error: "Error al crear el producto." };
  }
}

export async function adjustStockAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const productId = formData.get("productId") as string;
  const type = formData.get("type") as StockMovementType;
  const qty = parseInt(formData.get("qty") as string);
  const notes = ((formData.get("notes") as string) || "").trim() || undefined;

  if (!productId || !type || isNaN(qty) || qty < 0) {
    return { error: "Datos inválidos." };
  }

  try {
    const userId = await getActingUserId();

    if (type === "AJUSTE") {
      await db.$transaction([
        db.stockMovement.create({ data: { productId, userId, type, qty, notes } }),
        db.product.update({ where: { id: productId }, data: { stock: qty } }),
      ]);
    } else {
      const delta = type === "SALIDA" ? -qty : qty;
      await db.$transaction([
        db.stockMovement.create({ data: { productId, userId, type, qty, notes } }),
        db.product.update({ where: { id: productId }, data: { stock: { increment: delta } } }),
      ]);
    }

    revalidatePath("/admin/inventario");
    return { success: true };
  } catch {
    return { error: "Error al registrar el movimiento." };
  }
}
