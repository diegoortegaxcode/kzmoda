"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import clsx from "clsx";
import { updateOrderStatusAction } from "./actions";

type OrderStatus = "PENDIENTE" | "EN_PROCESO" | "EN_DESPACHO" | "COMPLETADO" | "CANCELADO";

const STATUSES: { value: OrderStatus; label: string; cls: string }[] = [
  { value: "PENDIENTE",   label: "Pendiente",   cls: "bg-amber-50 text-amber-700 border-amber-200"   },
  { value: "EN_PROCESO",  label: "En proceso",  cls: "bg-blue-50 text-blue-700 border-blue-200"      },
  { value: "EN_DESPACHO", label: "Despachado",  cls: "bg-violet-50 text-violet-700 border-violet-200"},
  { value: "COMPLETADO",  label: "Completado",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200"},
  { value: "CANCELADO",   label: "Cancelado",   cls: "bg-slate-100 text-slate-500 border-slate-200"  },
];

export default function OrderStatusSelect({ orderId, current }: { orderId: string; current: OrderStatus }) {
  const [status, setStatus] = useState<OrderStatus>(current);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const current_ = STATUSES.find((s) => s.value === status)!;

  function handleSelect(next: OrderStatus) {
    if (next === status) { setOpen(false); return; }
    setOpen(false);
    const prev = status;
    setStatus(next);
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, next);
      if (res.error) setStatus(prev);
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={clsx(
          "flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all",
          current_.cls
        )}
      >
        {isPending ? <Loader2 size={10} className="animate-spin" /> : null}
        {current_.label}
        <ChevronDown size={10} className={clsx("transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1 left-0 z-30 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden min-w-[140px]"
          >
            {STATUSES.map((s) => (
              <li key={s.value}>
                <button
                  onMouseDown={() => handleSelect(s.value)}
                  className={clsx(
                    "w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50",
                    s.value === status ? "font-semibold text-slate-900" : "text-slate-600"
                  )}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
