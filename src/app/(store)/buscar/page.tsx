import type { Metadata } from "next";
import { db } from "@/lib/db";
import { toPlainDescription } from "@/lib/product-description";
import { ShoppingCart, Plus, ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";
import SearchResultsClient from "./SearchResultsClient";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Resultados para "${q}"` : "Búsqueda",
    robots: { index: false, follow: false },
  };
}

export default async function BuscarPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  const products = term
    ? await db.product.findMany({
        where: {
          active: true,
          stock: { gt: 0 },
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { category: { name: { contains: term, mode: "insensitive" } } },
          ],
        },
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 60,
      })
    : [];

  const mapped = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: toPlainDescription(p.description),
    price: Number(p.price),
    images: p.images,
    category: p.category.name,
    categorySlug: p.category.slug,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-500 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Volver a la tienda
        </Link>
        {term ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>
              Resultados para{" "}
              <span style={{ color: "var(--brand-rose)" }}>&ldquo;{term}&rdquo;</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {mapped.length === 0
                ? "No encontramos productos con ese término."
                : `${mapped.length} producto${mapped.length !== 1 ? "s" : ""} encontrado${mapped.length !== 1 ? "s" : ""}`}
            </p>
          </>
        ) : (
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>
            Búsqueda
          </h1>
        )}
      </div>

      {!term || mapped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 bg-rose-50">
            <SearchX size={36} style={{ color: "var(--brand-rose)" }} />
          </div>
          <p className="text-slate-600 font-medium">
            {!term ? "Escribe algo para buscar" : `Sin resultados para "${term}"`}
          </p>
          {term && (
            <p className="text-sm text-slate-400 mt-1">
              Intenta con otro término o explora nuestra{" "}
              <Link href="/#productos" className="text-rose-500 hover:underline">
                colección completa
              </Link>
              .
            </p>
          )}
        </div>
      ) : (
        <SearchResultsClient products={mapped} />
      )}
    </div>
  );
}
