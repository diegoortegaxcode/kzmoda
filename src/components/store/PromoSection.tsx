"use client";

import { motion } from "framer-motion";
import { Flame, Plus, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { type StoreProduct } from "@/lib/mock-data";
import Link from "next/link";

export type PromoItem = StoreProduct & {
  discountPercent: number;
  discountedPrice: number;
  endsAt: string;
};

function useCountdown(endsAt: string): string {
  const [label, setLabel] = useState<string>("");
  useEffect(() => {
    function tick() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setLabel("Finaliza pronto"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) setLabel(`Termina en ${d}d ${h}h`);
      else if (h > 0) setLabel(`Termina en ${h}h ${m}m`);
      else setLabel(`Termina en ${m}m`);
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [endsAt]);
  return label;
}

function PromoCard({ product, index }: { product: PromoItem; index: number }) {
  const { add } = useCart();
  const countdown = useCountdown(product.endsAt);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group rounded-3xl border overflow-hidden bg-white"
      style={{ borderColor: "rgba(225,29,72,0.15)" }}
    >
      <Link href={`/producto/${product.id}`} className="block">
        <div className="aspect-[4/3] relative overflow-hidden bg-slate-50">
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span
            className="absolute top-3 left-3 px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-full text-white shadow-md"
            style={{ background: "var(--brand-rose)" }}
          >
            -{product.discountPercent}%
          </span>
          {countdown && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-black/60 text-white backdrop-blur">
              <Clock size={11} /> {countdown}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--brand-rose)" }}>
          {product.category}
        </p>
        <Link href={`/producto/${product.id}`} className="block">
          <h3 className="text-base font-bold text-slate-900 line-clamp-1">{product.name}</h3>
        </Link>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-rose-600">S/ {product.discountedPrice.toFixed(2)}</span>
              <span className="text-sm text-slate-400 line-through">S/ {product.price.toFixed(2)}</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-0.5">
              Ahorras S/ {(product.price - product.discountedPrice).toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => add({ id: product.id, name: product.name, price: product.discountedPrice, category: product.category, image: product.images[0] })}
            className="w-9 h-9 rounded-xl text-white flex items-center justify-center transition-transform hover:scale-105 shrink-0"
            style={{ background: "var(--brand-rose)" }}
            aria-label={`Agregar ${product.name}`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function PromoSection({ promotions }: { promotions: PromoItem[] }) {
  if (promotions.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between gap-4 mb-7">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--brand-rose)" }}>
            <Flame size={14} />
            Ofertas por tiempo limitado
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2" style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-black)" }}>
            Promociones
          </h2>
          <p className="text-sm text-slate-500 mt-2">Aprovecha estos descuentos antes de que terminen.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {promotions.map((product, index) => (
          <PromoCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}
