"use client";

import { motion } from "framer-motion";
import { Package, Users, CreditCard, ShoppingBag } from "lucide-react";
import KPICard from "@/components/KPICard";
import RecentOrders from "@/components/RecentOrders";
import StockAlerts from "@/components/StockAlerts";
import DebtPanel from "@/components/DebtPanel";

const kpis = [
  {
    title: "Productos activos",
    value: 248,
    trend: 12,
    trendLabel: "24 nuevos este mes",
    icon: <Package size={20} strokeWidth={2} />,
    color: "indigo" as const,
  },
  {
    title: "Clientes registrados",
    value: 1847,
    trend: 8,
    trendLabel: "+43 esta semana",
    icon: <Users size={20} strokeWidth={2} />,
    color: "emerald" as const,
  },
  {
    title: "Deudas pendientes",
    value: 12430,
    prefix: "S/ ",
    trend: -5,
    trendLabel: "vs. mes anterior",
    icon: <CreditCard size={20} strokeWidth={2} />,
    color: "rose" as const,
  },
  {
    title: "Pedidos del mes",
    value: 34,
    trend: 22,
    trendLabel: "vs. abril 2026",
    icon: <ShoppingBag size={20} strokeWidth={2} />,
    color: "amber" as const,
  },
];

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            <h1 className="text-lg font-bold text-slate-900">Resumen general</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Bienvenido de vuelta · {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <KPICard key={kpi.title} {...kpi} index={i} />
            ))}
          </div>

          {/* Orders + Stock */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <RecentOrders />
            </div>
            <StockAlerts />
          </div>

          {/* Debts */}
          <DebtPanel />

          {/* Catalog CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl px-6 py-5"
          >
            <div>
              <p className="text-sm font-bold text-white">Generar catálogo PDF</p>
              <p className="text-xs text-indigo-200 mt-0.5">
                {248} productos activos listos para exportar
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 bg-white text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-50 transition-colors shrink-0"
            >
              Exportar catálogo →
            </motion.button>
          </motion.div>

          <div className="pb-4" />
        </main>
  );
}
