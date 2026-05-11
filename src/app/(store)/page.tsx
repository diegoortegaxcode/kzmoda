import Hero from "@/components/store/Hero";
import ProductGrid from "@/components/store/ProductGrid";
import { mockProducts, mockCategories, type StoreProduct, type StoreCategory } from "@/lib/mock-data";

// ─── Swap this for real Prisma when DB is connected ──────────────────────────
// import { db } from "@/lib/db";
// export const revalidate = 60;
//
// async function getData(): Promise<{ products: StoreProduct[]; categories: StoreCategory[] }> {
//   const [raw, categories] = await Promise.all([
//     db.product.findMany({
//       where: { active: true, stock: { gt: 0 } },
//       include: { category: { select: { id: true, name: true, slug: true } } },
//       orderBy: { createdAt: "desc" },
//       take: 60,
//     }),
//     db.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
//   ]);
//   return {
//     products: raw.map((p) => ({
//       id: p.id, name: p.name, description: p.description ?? "",
//       price: Number(p.price), stock: p.stock, images: p.images,
//       category: p.category.name, categorySlug: p.category.slug,
//     })),
//     categories,
//   };
// }
// ─────────────────────────────────────────────────────────────────────────────

async function getData() {
  return { products: mockProducts, categories: mockCategories };
}

export default async function StorePage() {
  const { products, categories } = await getData();

  return (
    <>
      <Hero />
      <ProductGrid products={products} categories={categories} />
    </>
  );
}
