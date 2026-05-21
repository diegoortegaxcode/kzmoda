"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export interface RecentOrderRow {
  id: string;
  shortId: string;
  customerName: string;
  customerInitials: string;
  productName: string;
  productQty: number;
  total: number;
  status: string;
  createdAt: string;
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  PENDIENTE:   { label: "Pendiente",  cls: "bg-sky-50 text-sky-700 ring-sky-200"         },
  EN_PROCESO:  { label: "En proceso", cls: "bg-amber-50 text-amber-700 ring-amber-200"   },
  EN_DESPACHO: { label: "Despachado", cls: "bg-violet-50 text-violet-700 ring-violet-200"},
  COMPLETADO:  { label: "Completado", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200"},
  CANCELADO:   { label: "Cancelado",  cls: "bg-rose-50 text-rose-700 ring-rose-200"      },
};

const AVATAR_GRADIENTS = [
  "from-violet-400 to-purple-500", "from-sky-400 to-cyan-500",
  "from-pink-400 to-rose-500",     "from-amber-400 to-orange-500",
  "from-indigo-400 to-blue-500",   "from-teal-400 to-emerald-500",
];

export default function RecentOrders({ orders = [] }: { orders?: RecentOrderRow[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Pedidos recientes</h2>
          <p className="text-xs text-slate-400">{orders.length} últimos pedidos</p>
        </div>
        <Link href="/admin/pedidos" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
          Ver todos <ArrowUpRight size={13} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-center text-slate-400 py-10">Sin pedidos todavía</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {["Pedido", "Cliente", "Producto", "Total", "Estado", "Fecha"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const st = STATUS_STYLE[order.status] ?? STATUS_STYLE.PENDIENTE;
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono font-semibold text-slate-500">{order.shortId}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          "w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold shrink-0",
                          AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                        )}>
                          {order.customerInitials}
                        </div>
                        <span className="text-xs font-medium text-slate-800 whitespace-nowrap">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-slate-600 whitespace-nowrap">{order.productName}</span>
                      {order.productQty > 1 && <span className="text-[10px] text-slate-400 ml-1">×{order.productQty}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold text-slate-900">S/ {order.total.toLocaleString("es-PE")}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={clsx("text-[10px] font-semibold px-2 py-1 rounded-full ring-1", st.cls)}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{order.createdAt}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
