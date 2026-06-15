import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kmodayestilo.com";

  const products = await db.product.findMany({
    where: { active: true, stock: { gt: 0 } },
    select: { id: true, updatedAt: true },
  });

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/producto/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...productEntries,
  ];
}
