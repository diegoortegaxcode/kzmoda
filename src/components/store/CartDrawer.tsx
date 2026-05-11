"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const WHATSAPP_NUMBER = "51992032988";

function buildWhatsAppMessage(items: ReturnType<typeof useCart>["items"], total: number) {
  const lines = items.map((item) => {
    const sku = item.sku ? ` (SKU: ${item.sku})` : "";
    const size = item.size ? ` | Talla: ${item.size}` : "";
    const subtotal = (item.price * item.qty).toFixed(2);
    return `• ${item.name}${sku}${size} | x${item.qty} | S/ ${subtotal}`;
  });

  return [
    "¡Hola! Quiero realizar un pedido de *K Moda y Estilo* 🌸",
    "",
    ...lines,
    "",
    `*Total: S/ ${total.toFixed(2)}*`,
    "",
    "Por favor, ¿me pueden confirmar disponibilidad y coordinar el envío? 🙏",
  ].join("\n");
}

export default function CartDrawer() {
  const { isOpen, close, items, total, remove, setQty } = useCart();

  function handleCheckout() {
    const message = buildWhatsAppMessage(items, total);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--brand-rose-light)" }}
                >
                  <ShoppingBag size={20} style={{ color: "var(--brand-rose)" }} />
                </div>
                <div>
                  <h2
                    className="text-lg font-bold leading-tight"
                    style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-black)" }}
                  >
                    Tu Carrito
                  </h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    K Moda y Estilo
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className="w-10 h-10 hover:bg-rose-50 rounded-full flex items-center justify-center text-slate-400 hover:text-[var(--brand-rose)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingBag size={56} className="mb-4" style={{ color: "var(--brand-rose)" }} />
                  <p className="text-lg font-medium" style={{ fontFamily: "var(--font-playfair)" }}>
                    Carrito vacío
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Agrega algunas prendas para empezar.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => (
                    <motion.div layout key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-rose-50">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"}
                          className="w-full h-full object-cover"
                          alt={item.name}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h4 className="text-sm font-bold text-slate-900 truncate pr-2">{item.name}</h4>
                          <button
                            onClick={() => remove(item.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        {item.sku && (
                          <p className="text-[10px] text-slate-400 font-mono mb-0.5">SKU: {item.sku}</p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                            {item.category}
                          </p>
                          {item.size && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                              style={{ background: "var(--brand-rose-light)", color: "var(--brand-rose-dark)" }}
                            >
                              Talla {item.size}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg">
                            <button
                              onClick={() => setQty(item.id, item.qty - 1)}
                              className="w-6 h-6 flex items-center justify-center transition-colors hover:text-[var(--brand-rose)]"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="text-sm font-bold min-w-[1rem] text-center">{item.qty}</span>
                            <button
                              onClick={() => setQty(item.id, item.qty + 1)}
                              className="w-6 h-6 flex items-center justify-center transition-colors hover:text-[var(--brand-rose)]"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="text-sm font-black text-slate-900">
                            S/ {(item.price * item.qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-rose-100 bg-rose-50/30">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-slate-500 font-medium">Total</span>
                  <span
                    className="text-2xl font-black"
                    style={{ fontFamily: "var(--font-playfair)", color: "var(--brand-black)" }}
                  >
                    S/ {total.toFixed(2)}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 12px 32px -8px rgba(37,211,102,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 text-white transition-all"
                  style={{ background: "#25D366" }}
                >
                  <MessageCircle size={20} strokeWidth={2} />
                  Finalizar por WhatsApp
                </motion.button>
                <p className="text-center text-[10px] text-slate-400 mt-3 uppercase tracking-widest font-bold">
                  Envío coordinado directamente contigo
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
