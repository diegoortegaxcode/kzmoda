"use client";

import { useCart } from "@/lib/cart-context";
import { Plus } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  categorySlug: string;
}

export default function SearchResultsClient({ products }: { products: Product[] }) {
  const { add } = useCart();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300"
        >
          <div className="aspect-square relative overflow-hidden bg-gray-50">
            <Link href={`/producto/${product.id}`} className="block h-full w-full">
              <img
                src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-600 shadow-sm">
                  {product.category}
                </span>
              </div>
            </Link>
            <button
              onClick={() =>
                add({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  category: product.category,
                  image: product.images[0],
                })
              }
              type="button"
              className="absolute bottom-4 right-4 z-10 w-12 h-12 bg-white/90 backdrop-blur shadow-lg rounded-2xl flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:text-white"
              style={{ color: "var(--brand-rose)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-rose)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.9)")}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="p-5">
            <Link href={`/producto/${product.id}`} className="block">
              <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-rose-500 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 mb-3 line-clamp-1">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-gray-900">S/ {product.price.toFixed(2)}</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                En stock
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
