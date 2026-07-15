"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type PromotionRow = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  discountPercent: number;
  discountedPrice: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  isLive: boolean;
  createdAt: string;
};

export type ProductOption = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

export type ActionResult = { success?: true; error?: string } | null;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Interpreta el valor de <input datetime-local> como hora de Perú (UTC-5 fijo,
// sin horario de verano). Independiente de la zona del servidor/navegador.
// Acepta también un ISO ya normalizado (con Z u offset) por compatibilidad.
function parsePeruDate(raw: string): Date {
  const hasZone = /[zZ]$|[+-]\d\d:?\d\d$/.test(raw);
  if (hasZone) return new Date(raw);
  const withSeconds = raw.length === 16 ? `${raw}:00` : raw;
  return new Date(`${withSeconds}-05:00`);
}

export async function getPromotions(): Promise<PromotionRow[]> {
  const now = new Date();
  const rows = await db.promotion.findMany({
    orderBy: [{ active: "desc" }, { endsAt: "asc" }],
    include: { product: { select: { name: true, price: true, images: true } } },
  });
  return rows.map((p) => {
    const price = Number(p.product.price);
    return {
      id: p.id,
      productId: p.productId,
      productName: p.product.name,
      productImage: p.product.images[0] ?? "",
      productPrice: price,
      discountPercent: p.discountPercent,
      discountedPrice: round2(price * (1 - p.discountPercent / 100)),
      startsAt: p.startsAt.toISOString(),
      endsAt: p.endsAt.toISOString(),
      active: p.active,
      isLive: p.active && p.startsAt <= now && p.endsAt >= now,
      createdAt: p.createdAt.toISOString(),
    };
  });
}

export async function getProductOptions(): Promise<ProductOption[]> {
  const rows = await db.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: { category: { select: { name: true } } },
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image: p.images[0] ?? "",
    category: p.category.name,
  }));
}

function parsePromoForm(formData: FormData) {
  const productId = (formData.get("productId") as string || "").trim();
  const discountPercent = parseInt((formData.get("discountPercent") as string || "").trim(), 10);
  const startsAtRaw = (formData.get("startsAt") as string || "").trim();
  const endsAtRaw = (formData.get("endsAt") as string || "").trim();

  if (!productId) return { error: "Selecciona un producto" as const };
  if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 99)
    return { error: "El descuento debe estar entre 1% y 99%" as const };
  if (!endsAtRaw) return { error: "Indica la fecha de fin de la promoción" as const };

  const startsAt = startsAtRaw ? parsePeruDate(startsAtRaw) : new Date();
  const endsAt = parsePeruDate(endsAtRaw);
  if (isNaN(endsAt.getTime())) return { error: "Fecha de fin inválida" as const };
  if (endsAt <= startsAt) return { error: "La fecha de fin debe ser posterior al inicio" as const };

  return { productId, discountPercent, startsAt, endsAt };
}

export async function createPromotionAction(_: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = parsePromoForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await db.promotion.create({
    data: {
      productId: parsed.productId,
      discountPercent: parsed.discountPercent,
      startsAt: parsed.startsAt,
      endsAt: parsed.endsAt,
    },
  });
  revalidatePath("/admin/promociones");
  revalidatePath("/");
  return { success: true };
}

export async function updatePromotionAction(_: unknown, formData: FormData): Promise<ActionResult> {
  const id = (formData.get("id") as string || "").trim();
  if (!id) return { error: "Promoción no encontrada" };
  const parsed = parsePromoForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await db.promotion.update({
    where: { id },
    data: {
      productId: parsed.productId,
      discountPercent: parsed.discountPercent,
      startsAt: parsed.startsAt,
      endsAt: parsed.endsAt,
    },
  });
  revalidatePath("/admin/promociones");
  revalidatePath("/");
  return { success: true };
}

export async function togglePromotionAction(id: string, active: boolean) {
  await db.promotion.update({ where: { id }, data: { active } });
  revalidatePath("/admin/promociones");
  revalidatePath("/");
}

export async function deletePromotionAction(id: string) {
  await db.promotion.delete({ where: { id } });
  revalidatePath("/admin/promociones");
  revalidatePath("/");
}
