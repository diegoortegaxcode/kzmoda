import Hero from "@/components/store/Hero";
import ProductGrid from "@/components/store/ProductGrid";
import ProductShowcase from "@/components/store/ProductShowcase";
import StoreFooter from "@/components/store/StoreFooter";
import { db } from "@/lib/db";
import { type StoreProduct, type StoreCategory } from "@/lib/mock-data";
import { toPlainDescription } from "@/lib/product-description";

export const revalidate = 60;

async function getData(): Promise<{ products: StoreProduct[]; categories: StoreCategory[] }> {
  const [raw, categories] = await Promise.all([
    db.product.findMany({
      where: { active: true, stock: { gt: 0 } },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    db.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  return {
    products: raw.map((p) => ({
      id: p.id,
      name: p.name,
      description: toPlainDescription(p.description),
      price: Number(p.price),
      stock: p.stock,
      images: p.images,
      category: p.category.name,
      categorySlug: p.category.slug,
    })),
    categories,
  };
}

export default async function StorePage() {
  const { products, categories } = await getData();
  const popularProducts = [...products].sort((a, b) => b.stock - a.stock).slice(0, 8);
  const popularIds = new Set(popularProducts.map((product) => product.id));
  const recommendedProducts = products
    .filter((product) => !popularIds.has(product.id))
    .sort((a, b) => a.price - b.price)
    .slice(0, 8);

  return (
    <>
      <section id="novedades">
        <Hero />
      </section>
      <ProductGrid products={products} categories={categories} />
      <section id="ofertas">
        <ProductShowcase
          mode="popular"
          title="Productos populares"
          subtitle="Los favoritos de nuestra comunidad esta semana."
          products={popularProducts}
        />
      </section>
      <section id="interes">
        <ProductShowcase
          mode="interest"
          title="Productos que te podrían interesar"
          subtitle="Selección recomendada según tendencias y relación calidad-precio."
          products={recommendedProducts}
        />
      </section>
      <StoreFooter />
    </>
  );
}
