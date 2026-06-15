"use server";

import { db } from "@/lib/db";
import { uploadToS3 } from "@/lib/s3";
import { revalidatePath } from "next/cache";

export type BannerRow = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  active: boolean;
  order: number;
  createdAt: Date;
};

export async function getBanners(): Promise<BannerRow[]> {
  return db.banner.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
}

export async function createBannerAction(_: unknown, formData: FormData) {
  const file = formData.get("image") as File | null;
  const imageUrl = (formData.get("imageUrl") as string || "").trim();
  const title = (formData.get("title") as string || "").trim() || null;
  const subtitle = (formData.get("subtitle") as string || "").trim() || null;
  const link = (formData.get("link") as string || "").trim() || null;

  let finalUrl = imageUrl;
  if (file && file.size > 0) {
    try { finalUrl = await uploadToS3(file); } catch { return { error: "Error al subir imagen a S3" }; }
  }
  if (!finalUrl) return { error: "Debes proveer una imagen o URL" };

  const count = await db.banner.count();
  await db.banner.create({ data: { imageUrl: finalUrl, title, subtitle, link, order: count } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return null;
}

export async function toggleBannerAction(id: string, active: boolean) {
  await db.banner.update({ where: { id }, data: { active } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBannerAction(id: string) {
  await db.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
