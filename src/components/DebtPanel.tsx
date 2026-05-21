"use client";

import { motion } from "framer-motion";
import { CreditCard, ArrowUpRight, Clock } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export interface DebtPanelRow {
  id: string;
  customer: string;
  avatar: string;
  amount: number;
  amountPaid: number;
  remaining: number;
  status: "PENDIENTE" | "PARCIAL" | "VENCIDO" | "PAGADO" | "CONDONADO";
  daysOverdue: number;
  paymentsCount: number;
}

interface DebtPanelProps {
  debts?: DebtPanelRow[];
  onPagar?: (debt: DebtPanelRow) => void;
}

const MOCK: DebtPanelRow[] = [
  { id: "1", customer: "Miguel Ccopa", avatar: "MC", amount: 1840, amountPaid: 0, remaining: 1840, status: "VENCIDO", daysOverdue: 45, paymentsCount: 0 },
  { id: "2", customer: "Rosa Huanca", avatar: "RH", amount: 620, amountPaid: 0, remaining: 620, status: "VENCIDO", daysOverdue: 18, paymentsCount: 0 },
  { id: "3", customer: "Tienda Don Pepe", avatar: "TP", amount: 3200, amountPaid: 500, remaining: 2700, status: "PARCIAL", daysOverdue: 62, paymentsCount: 1 },
  { id: "4", customer: "Fernanda Ruiz", avatar: "FR", amount: 280, amountPaid: 0, remaining: 280, status: "PENDIENTE", daysOverdue: 7, paymentsCount: 0 },
  { id: "5", customer: "Distribuidora Norte", avatar: "DN", amount: 890, amountPaid: 0, remaining: 890, status: "PENDIENTE", daysOverdue: 0, paymentsCount: 0 },
  { id: "6", customer: "Luis Condori", avatar: "LC", amount: 150, amountPaid: 50, remaining: 100, status: "PARCIAL", daysOverdue: 3, paymentsCount: 1 },
];

const statusMap: Record<DebtPanelRow["status"], { label: string; dot: string; text: string; bg: string }> = {
  PENDIENTE: { label: "Pendiente", dot: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50 ring-amber-200" },
  PARCIAL:   { label: "Parcial",   dot: "bg-blue-500",  text: "text-blue-600",  bg: "bg-blue-50 ring-blue-200"  },
  VENCIDO:   { label: "Vencido",   dot: "bg-rose-500",  text: "text-rose-600",  bg: "bg-rose-50 ring-rose-200"  },
  PAGADO:    { label: "Pagado",    dot: "bg-emerald-500",text: "text-emerald-600",bg: "bg-emerald-50 ring-emerald-200" },
  CONDONADO: { label: "Condonado", dot: "bg-slate-400", text: "text-slate-500", bg: "bg-slate-50 ring-slate-200" },
};

const avatarGradients = [
  "from-rose-400 to-pink-500", "from-violet-400 to-purple-500",
  "from-orange-400 to-amber-500", "from-teal-400 to-cyan-500",
  "from-blue-400 to-indigo-500", "from-green-400 to-emerald-500",
];

export default function DebtPanel({ debts = MOCK, onPagar }: DebtPanelProps) {
  const totalRemaining = debts.reduce((s, d) => s + d.remaining, 0);
  const inMora = debts.filter((d) => d.status === "VENCIDO" || d.daysOverdue > 0);
  const totalMora = inMora.reduce((s, d) => s + d.remaining, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.6 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center">
            <CreditCard size={12} className="text-rose-600" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Módulo de deudas</h2>
            <p className="text-xs text-slate-400">
              S/ {totalMora.toLocaleString("es-PE")} en mora · {inMora.length} cliente{inMora.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Link href="/admin/deudas" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
          Ver reporte <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* Summary bar */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-6">
        <div>
          <p className="text-[10px] text-slate-400 mb-0.5">Total pendiente</p>
          <p className="text-sm font-bold text-slate-900">S/ {totalRemaining.toLocaleString("es-PE")}</p>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div>
          <p className="text-[10px] text-slate-400 mb-0.5">En mora</p>
          <p className="text-sm font-bold text-rose-600">S/ {totalMora.toLocaleString("es-PE")}</p>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div>
          <p className="text-[10px] text-slate-400 mb-0.5">Deudas activas</p>
          <p className="text-sm font-bold text-slate-900">{debts.length}</p>
        </div>
        {totalRemaining > 0 && (
          <div className="flex-1 hidden sm:block">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round((totalMora / totalRemaining) * 100))}%` }}
                transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {Math.round((totalMora / totalRemaining) * 100)}% del total en mora
            </p>
          </div>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50">
        {debts.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-400">Sin deudas pendientes.</p>
        )}
        {debts.map((debt, i) => {
          const { label, dot, text, bg } = statusMap[debt.status] ?? statusMap.PENDIENTE;
          return (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
              whileHover={{ backgroundColor: "#F8FAFC" }}
              className="flex items-center gap-4 px-5 py-3.5 group"
            >
              <div className={clsx("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold shrink-0", avatarGradients[i % avatarGradients.length])}>
                {debt.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{debt.customer}</p>
                <p className="text-[10px] text-slate-400">
                  {debt.paymentsCount > 0 ? `${debt.paymentsCount} pago${debt.paymentsCount > 1 ? "s" : ""} realizados` : "Sin pagos"}
                </p>
              </div>
              {debt.daysOverdue > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock size={10} />{debt.daysOverdue}d
                </div>
              )}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-900">S/ {debt.remaining.toLocaleString("es-PE")}</p>
                {debt.amountPaid > 0 && (
                  <p className="text-[10px] text-slate-400">de S/ {debt.amount.toLocaleString("es-PE")}</p>
                )}
              </div>
              <span className={clsx("text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 shrink-0", bg, text)}>
                <span className={clsx("inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle", dot)} />
                {label}
              </span>
              {onPagar && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onPagar(debt)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all shrink-0 opacity-0 group-hover:opacity-100"
                  style={{ background: "var(--brand-rose-light)", color: "var(--brand-rose)" }}
                >
                  Cobrar
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
