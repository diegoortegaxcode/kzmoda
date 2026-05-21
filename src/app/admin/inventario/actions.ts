"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { uploadToS3 } from "@/lib/s3";
import { plainTextToRichHtml, sanitizeRichDescription, stripHtml } from "@/lib/product-description";
type StockMovementType = "ENTRADA" | "SALIDA" | "AJUSTE" | "DEVOLUCION";

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  description: string;
  stock: number;
  minStock: number;
  price: number;
  costPrice: number;
  active: boolean;
  categoryId: string;
  category: string;
  image: string;
};

export type CategoryOption = { id: string; name: string };
export type CategoryRow = { id: string; name: string; active: boolean };

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
  const [rawProducts, categories, allCategories] = await Promise.all([
    db.product.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ active: "desc" }, { name: "asc" }],
    }),
    db.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, active: true },
    }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: ProductRow[] = rawProducts.map((p: any) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    description: p.description ?? "",
    stock: p.stock,
    minStock: p.minStock,
    price: Number(p.price),
    costPrice: Number(p.costPrice),
    active: p.active,
    categoryId: p.categoryId,
    category: p.category.name,
    image: p.images[0] ?? "",
  }));

  return { products, categories, allCategories };
}

export async function createCategoryAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string).trim();
  if (!name) return { error: "El nombre es requerido." };

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  try {
    await db.category.create({ data: { name, slug } });
    revalidatePath("/admin/inventario");
    return { success: true };
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") return { error: "Esa categoría ya existe." };
    return { error: "Error al crear la categoría." };
  }
}

export async function toggleCategoryAction(id: string, active: boolean): Promise<ActionResult> {
  try {
    await db.category.update({ where: { id }, data: { active: !active } });
    revalidatePath("/admin/inventario");
    return { success: true };
  } catch {
    return { error: "Error al actualizar la categoría." };
  }
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
  const rawDescription = ((formData.get("description") as string) || "").trim();
  const formattedDescription = /<\/?[a-z][\s\S]*>/i.test(rawDescription) ? rawDescription : plainTextToRichHtml(rawDescription);
  const safeDescription = sanitizeRichDescription(formattedDescription);
  const plainDescription = stripHtml(safeDescription);
  const description = plainDescription.length === 0 ? undefined : safeDescription;

  if (!name || !sku || !categoryId || isNaN(price) || isNaN(costPrice)) {
    return { error: "Completa todos los campos requeridos." };
  }
  if (price <= 0 || costPrice <= 0) {
    return { error: "Los precios deben ser mayores a 0." };
  }

  // ─── Image handling → S3 ─────────────────────────────────────────────────
  let images: string[] = [];
  const imageFile = formData.get("imageFile") as File | null;
  const imageUrl = ((formData.get("imageUrl") as string) || "").trim();

  if (imageFile && imageFile.size > 0) {
    const s3Url = await uploadToS3(imageFile);
    images = [s3Url];
  } else if (imageUrl) {
    images = [imageUrl];
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    await db.product.create({
      data: { name, sku, categoryId, price, costPrice, stock, minStock, description, images },
    });
    revalidatePath("/admin/inventario");
    revalidatePath("/");
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

export async function updateProductAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const productId = (formData.get("productId") as string).trim();
  const name = (formData.get("name") as string).trim();
  const sku = (formData.get("sku") as string).trim().toUpperCase();
  const categoryId = (formData.get("categoryId") as string).trim();
  const price = parseFloat(formData.get("price") as string);
  const costPrice = parseFloat(formData.get("costPrice") as string);
  const minStock = parseInt(formData.get("minStock") as string) || 5;
  const rawDescription = ((formData.get("description") as string) || "").trim();
  const formattedDescription = /<\/?[a-z][\s\S]*>/i.test(rawDescription) ? rawDescription : plainTextToRichHtml(rawDescription);
  const safeDescription = sanitizeRichDescription(formattedDescription);
  const plainDescription = stripHtml(safeDescription);
  const description = plainDescription.length === 0 ? null : safeDescription;
  const currentImage = ((formData.get("currentImage") as string) || "").trim();

  if (!productId || !name || !sku || !categoryId || isNaN(price) || isNaN(costPrice)) {
    return { error: "Completa todos los campos requeridos." };
  }
  if (price <= 0 || costPrice <= 0) {
    return { error: "Los precios deben ser mayores a 0." };
  }

  let image = currentImage;
  const imageFile = formData.get("imageFile") as File | null;
  const imageUrl = ((formData.get("imageUrl") as string) || "").trim();

  if (imageFile && imageFile.size > 0) {
    image = await uploadToS3(imageFile);
  } else if (imageUrl) {
    image = imageUrl;
  }

  try {
    await db.product.update({
      where: { id: productId },
      data: {
        name,
        sku,
        categoryId,
        price,
        costPrice,
        minStock,
        description,
        images: image ? [image] : [],
      },
    });
    revalidatePath("/admin/inventario");
    revalidatePath("/");
    return { success: true };
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") return { error: "El SKU ya existe." };
    return { error: "Error al actualizar el producto." };
  }
}
