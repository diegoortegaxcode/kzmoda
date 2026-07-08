import type { Metadata } from "next";
import Hero from "@/components/store/Hero";
import ProductGrid from "@/components/store/ProductGrid";
import ProductShowcase from "@/components/store/ProductShowcase";
import PromoSection, { type PromoItem } from "@/components/store/PromoSection";
import StoreFooter from "@/components/store/StoreFooter";
import { db } from "@/lib/db";
import { type StoreProduct, type StoreCategory } from "@/lib/mock-data";
import { toPlainDescription } from "@/lib/product-description";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KZ Tendencias — Moda femenina con elegancia",
  description: "Descubre nuestra colección exclusiva de moda femenina. Prendas de calidad con precios directos y entrega rápida en Lima, Perú.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kztendencias.com",
  },
};

type BannerData = { imageUrl: string; title: string | null; subtitle: string | null; link: string | null };
async function getData(): Promise<{ products: StoreProduct[]; categories: StoreCategory[]; banners: BannerData[]; promotions: PromoItem[] }> {
  const now = new Date();
  const [raw, categories, banners, promoRows] = await Promise.all([
    db.product.findMany({
      where: { active: true, stock: { gt: 0 } },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    db.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.banner.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }], select: { imageUrl: true, title: true, subtitle: true, link: true } }),
    db.promotion.findMany({
      where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { discountPercent: "desc" },
      include: {
        product: { include: { category: { select: { name: true, slug: true } } } },
      },
    }),
  ]);

  // One promo per product (highest discount), and only products with stock.
  const seen = new Set<string>();
  const promotions: PromoItem[] = [];
  for (const promo of promoRows) {
    const p = promo.product;
    if (!p.active || p.stock <= 0 || seen.has(p.id)) continue;
    seen.add(p.id);
    const price = Number(p.price);
    promotions.push({
      id: p.id,
      name: p.name,
      description: toPlainDescription(p.description),
      price,
      cashPrice: p.cashPrice ? Number(p.cashPrice) : null,
      separateDeposit: p.separateDeposit ? Number(p.separateDeposit) : null,
      stock: p.stock,
      images: p.images,
      category: p.category.name,
      categorySlug: p.category.slug,
      discountPercent: promo.discountPercent,
      discountedPrice: Math.round(price * (1 - promo.discountPercent / 100) * 100) / 100,
      endsAt: promo.endsAt.toISOString(),
    });
  }

  return {
    banners,
    promotions,
    products: raw.map((p) => ({
      id: p.id,
      name: p.name,
      description: toPlainDescription(p.description),
      price: Number(p.price),
      cashPrice: p.cashPrice ? Number(p.cashPrice) : null,
      separateDeposit: p.separateDeposit ? Number(p.separateDeposit) : null,
      stock: p.stock,
      images: p.images,
      category: p.category.name,
      categorySlug: p.category.slug,
    })),
    categories,
  };
}

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kztendencias.com";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: "KZ Tendencias",
  url: base,
  description: "Tienda de moda femenina con calidad garantizada y entrega rápida.",
  address: { "@type": "PostalAddress", addressCountry: "PE" },
};

export default async function StorePage() {
  const { products, categories, banners, promotions } = await getData();
  const popularProducts = [...products].sort((a, b) => b.stock - a.stock).slice(0, 8);
  const popularIds = new Set(popularProducts.map((product) => product.id));
  const recommendedProducts = products
    .filter((product) => !popularIds.has(product.id))
    .sort((a, b) => a.price - b.price)
    .slice(0, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <section id="novedades">
        <Hero banners={banners} />
      </section>
      <section id="promociones">
        <PromoSection promotions={promotions} />
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
