"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function ProductDetailActions({
  product,
}: {
  product: { id: string; name: string; price: number; category: string; image?: string; stock: number };
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const subtotal = product.price * qty;

  function handleAdd() {
    for (let i = 0; i < qty; i += 1) add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-2xl border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setQty((prev) => Math.max(1, prev - 1))}
          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label="Disminuir cantidad"
        >
          <Minus size={15} />
        </button>
        <div className="w-12 h-10 flex items-center justify-center text-sm font-bold text-slate-900 border-x border-slate-200">
          {qty}
        </div>
        <button
          type="button"
          onClick={() => setQty((prev) => Math.min(product.stock, prev + 1))}
          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
          aria-label="Aumentar cantidad"
          disabled={qty >= product.stock}
        >
          <Plus size={15} />
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{ background: added ? "#16a34a" : "var(--brand-rose)" }}
        aria-label={`Agregar ${product.name} al carrito`}
      >
        {added ? <Check size={16} /> : <ShoppingBag size={16} />}
        {added ? "Agregado al carrito" : `Agregar ${qty}`}
      </button>

      <div className="h-10 px-4 rounded-xl border border-slate-200 bg-white inline-flex items-center text-sm font-semibold text-slate-700">
        Subtotal: <span className="ml-1.5 font-black text-slate-900">S/ {subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
