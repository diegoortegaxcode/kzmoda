"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";

export interface LowStockItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
}

export default function StockAlerts({ items = [] }: { items?: LowStockItem[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = items.filter((i) => !dismissed.includes(i.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
            <AlertTriangle size={12} className="text-amber-600" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Stock bajo</h2>
            <p className="text-xs text-slate-400">{visible.length} productos críticos</p>
          </div>
        </div>
        <Link href="/admin/inventario" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
          Ver inventario
        </Link>
      </div>

      <div className="divide-y divide-slate-50">
        <AnimatePresence>
          {visible.map((item, i) => {
            const pct = Math.round((item.stock / item.minStock) * 100);
            const critical = item.stock === 0 || pct < 30;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <motion.div
                  initial={{ x: 12 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  whileHover={{ backgroundColor: "#FAFAFA" }}
                  className="px-5 py-3.5 cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx("w-2 h-2 rounded-full shrink-0", critical ? "bg-rose-400" : "bg-amber-400")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-slate-800 truncate">{item.name}</p>
                        <span className={clsx("text-[10px] font-bold ml-2 shrink-0", critical ? "text-rose-600" : "text-amber-600")}>
                          {item.stock} uds
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ delay: 0.5 + i * 0.06, duration: 0.5 }}
                            className={clsx("h-full rounded-full", critical ? "bg-rose-400" : "bg-amber-400")}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">min {item.minStock}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDismissed((p) => [...p, item.id])}
                      className="text-[10px] text-slate-300 hover:text-slate-400 transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {visible.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center text-xs text-slate-400">
          ✓ Todo el stock en niveles óptimos
        </motion.div>
      )}
    </motion.div>
  );
}
