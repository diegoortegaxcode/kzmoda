"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { type StoreProduct } from "@/lib/mock-data";
import Link from "next/link";

interface ProductShowcaseProps {
  title: string;
  subtitle: string;
  products: StoreProduct[];
  mode: "popular" | "interest";
}

const iconByMode = {
  popular: TrendingUp,
  interest: Sparkles,
} as const;

export default function ProductShowcase({ title, subtitle, products, mode }: ProductShowcaseProps) {
  const { add } = useCart();
  const Icon = iconByMode[mode];

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between gap-4 mb-7">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--brand-rose)" }}>
            <Icon size={14} />
            Curado para ti
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2" style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-black)" }}>
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-2">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.article
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="group rounded-3xl border overflow-hidden bg-white"
            style={{ borderColor: "rgba(15,15,15,0.07)" }}
          >
            <Link href={`/producto/${product.id}`} className="block">
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-50">
                <img
                  src={product.images[0] || "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full"
                  style={{ background: "var(--brand-gold-light)", color: "var(--brand-gold-dark)" }}
                >
                  {mode === "popular" ? "Popular" : "Recomendado"}
                </span>
              </div>
            </Link>

            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--brand-rose)" }}>
                {product.category}
              </p>
              <Link href={`/producto/${product.id}`} className="block">
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{product.name}</h3>
              </Link>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-10">{product.description}</p>

              <div className="mt-4 flex items-start justify-between gap-2">
                <div>
                  <span className="text-lg font-black text-slate-900">S/ {product.price.toFixed(2)}</span>
                  {product.cashPrice && (
                    <p className="text-xs font-semibold text-rose-500 mt-0.5">
                      🔥 Al contado S/ {product.cashPrice.toFixed(2)}
                    </p>
                  )}
                  {product.separateDeposit && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sepáralo desde S/ {product.separateDeposit.toFixed(2)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => add({ id: product.id, name: product.name, price: product.price, category: product.category, image: product.images[0] })}
                  className="w-9 h-9 rounded-xl text-white flex items-center justify-center transition-transform hover:scale-105 shrink-0"
                  style={{ background: "var(--brand-rose)" }}
                  aria-label={`Agregar ${product.name}`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
