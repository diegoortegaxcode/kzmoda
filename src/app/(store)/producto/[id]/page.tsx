import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { db } from "@/lib/db";
import ProductShowcase from "@/components/store/ProductShowcase";
import StoreFooter from "@/components/store/StoreFooter";
import ProductDetailActions from "@/components/store/ProductDetailActions";
import { normalizeDescriptionForRender, toPlainDescription } from "@/lib/product-description";
import { type StoreProduct } from "@/lib/mock-data";

export const revalidate = 60;

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kmodayestilo.com";

  const product = await db.product.findUnique({
    where: { id, active: true },
    select: { name: true, description: true, price: true, images: true, category: { select: { name: true } } },
  });

  if (!product) return { title: "Producto no encontrado — K Moda y Estilo" };

  const plainDesc = toPlainDescription(product.description) || `${product.name} en K Moda y Estilo. Moda femenina con calidad garantizada.`;
  const image = product.images[0] ?? null;

  return {
    title: `${product.name} — K Moda y Estilo`,
    description: plainDesc.slice(0, 160),
    alternates: { canonical: `${base}/producto/${id}` },
    openGraph: {
      title: `${product.name} — K Moda y Estilo`,
      description: plainDesc.slice(0, 160),
      url: `${base}/producto/${id}`,
      type: "website",
      locale: "es_PE",
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kmodayestilo.com";

  const product = await db.product.findUnique({
    where: { id, active: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  if (!product || product.stock <= 0) notFound();

  const relatedRaw = await db.product.findMany({
    where: {
      active: true,
      stock: { gt: 0 },
      id: { not: product.id },
      OR: [
        { categoryId: product.categoryId },
        { price: { gte: Number(product.price) * 0.75, lte: Number(product.price) * 1.25 } },
      ],
    },
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const related: StoreProduct[] = relatedRaw.map((item) => ({
    id: item.id,
    name: item.name,
    description: toPlainDescription(item.description),
    price: Number(item.price),
    stock: item.stock,
    images: item.images,
    category: item.category.name,
    categorySlug: item.category.slug,
  }));

  const safeDescription = normalizeDescriptionForRender(product.description ?? "");
  const hasRichDescription = safeDescription.length > 0;
  const plainDesc = toPlainDescription(product.description) || `${product.name} en K Moda y Estilo.`;
  const heroImage = product.images[0] || "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: plainDesc.slice(0, 500),
    image: product.images.length > 0 ? product.images : [heroImage],
    sku: product.sku,
    offers: {
      "@type": "Offer",
      url: `${base}/producto/${id}`,
      priceCurrency: "PEN",
      price: Number(product.price).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "K Moda y Estilo" },
    },
    brand: { "@type": "Brand", name: "K Moda y Estilo" },
    category: product.category.name,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[var(--brand-rose)] transition-colors"
        >
          <ArrowLeft size={15} />
          Volver al catálogo
        </Link>

        <div className="mt-6 grid lg:grid-cols-2 gap-10 items-start">
          <div className="rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 relative aspect-square">
            <Image
              src={heroImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={heroImage.includes("unsplash.com")}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--brand-rose)" }}>
              {product.category.name}
            </p>
            <h1
              className="text-3xl sm:text-4xl font-bold mt-2"
              style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-black)" }}
            >
              {product.name}
            </h1>
            <p className="text-3xl font-black mt-4 text-slate-900">S/ {Number(product.price).toFixed(2)}</p>
            <ProductDetailActions
              product={{
                id: product.id,
                name: product.name,
                price: Number(product.price),
                category: product.category.name,
                image: product.images[0],
                stock: product.stock,
              }}
            />

            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Stock disponible: {product.stock}
            </div>

            {hasRichDescription ? (
              <article
                className="prose prose-slate max-w-none mt-6 prose-p:leading-relaxed prose-li:leading-relaxed prose-headings:font-semibold"
                dangerouslySetInnerHTML={{ __html: safeDescription }}
              />
            ) : (
              <p className="text-slate-500 mt-6 leading-relaxed">Este producto no tiene descripción detallada aún.</p>
            )}

            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, text: "Compra protegida" },
                { icon: Truck, text: "Entrega rápida" },
                { icon: ShoppingBag, text: "Calidad garantizada" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 flex items-center gap-2.5">
                  <Icon size={16} style={{ color: "var(--brand-rose)" }} />
                  <span className="text-xs font-semibold text-slate-600">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="interes">
        <ProductShowcase
          mode="interest"
          title="Productos que te podrían interesar"
          subtitle="Opciones seleccionadas por estilo, categoría y rango de precio."
          products={related}
        />
      </section>
      <StoreFooter />
    </>
  );
}
