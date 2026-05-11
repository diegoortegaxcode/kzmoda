"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import clsx from "clsx";

type Status = "completado" | "en_proceso" | "pendiente" | "cancelado";

interface Order {
  id: string;
  client: string;
  avatar: string;
  product: string;
  qty: number;
  total: number;
  status: Status;
  date: string;
}

const orders: Order[] = [
  { id: "#4821", client: "María Torres", avatar: "MT", product: "Zapatillas Runner Pro", qty: 2, total: 280, status: "completado", date: "Hoy, 10:32" },
  { id: "#4820", client: "Carlos Ríos", avatar: "CR", product: "Polo Oversize Blanco", qty: 5, total: 125, status: "en_proceso", date: "Hoy, 09:15" },
  { id: "#4819", client: "Lucía Mendoza", avatar: "LM", product: "Bolso Cuero Vintage", qty: 1, total: 340, status: "pendiente", date: "Ayer, 16:44" },
  { id: "#4818", client: "Jorge Salas", avatar: "JS", product: "Casaca Denim", qty: 3, total: 450, status: "completado", date: "Ayer, 14:20" },
  { id: "#4817", client: "Ana Flores", avatar: "AF", product: "Short Deportivo", qty: 4, total: 96, status: "cancelado", date: "Ayer, 11:05" },
  { id: "#4816", client: "Pedro Vega", avatar: "PV", product: "Zapatillas Casual", qty: 1, total: 180, status: "en_proceso", date: "02/05, 09:30" },
];

const statusConfig: Record<Status, { label: string; className: string }> = {
  completado: { label: "Completado", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  en_proceso: { label: "En proceso", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  pendiente: { label: "Pendiente", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  cancelado: { label: "Cancelado", className: "bg-rose-50 text-rose-700 ring-rose-200" },
};

const avatarColors = [
  "from-violet-400 to-purple-500",
  "from-sky-400 to-cyan-500",
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-indigo-400 to-blue-500",
  "from-teal-400 to-emerald-500",
];

export default function RecentOrders() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Pedidos recientes</h2>
          <p className="text-xs text-slate-400">6 pedidos esta semana</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          Ver todos <ArrowUpRight size={13} />
        </motion.button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-50">
              {["Pedido", "Cliente", "Producto", "Total", "Estado", "Fecha"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3"
                >
                  {h}
                </th>
              ))}
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => {
              const { label, className } = statusConfig[order.status];
              return (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.06, duration: 0.35 }}
                  whileHover={{ backgroundColor: "#F8FAFC" }}
                  className="border-b border-slate-50 last:border-0 cursor-pointer"
                >
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono font-semibold text-slate-500">{order.id}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={clsx(
                          "w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold shrink-0",
                          avatarColors[i % avatarColors.length]
                        )}
                      >
                        {order.avatar}
                      </div>
                      <span className="text-xs font-medium text-slate-800 whitespace-nowrap">{order.client}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-slate-600 whitespace-nowrap">{order.product}</span>
                    <span className="text-[10px] text-slate-400 ml-1">×{order.qty}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-semibold text-slate-900">
                      S/ {order.total.toLocaleString("es-PE")}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={clsx(
                        "text-[10px] font-semibold px-2 py-1 rounded-full ring-1",
                        className
                      )}
                    >
                      {label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{order.date}</span>
                  </td>
                  <td className="px-5 py-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100"
                    >
                      <MoreHorizontal size={13} className="text-slate-400" />
                    </motion.button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
