"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Search } from "lucide-react";
import clsx from "clsx";
import OrderStatusSelect from "./OrderStatusSelect";

type OrderStatus = "PENDIENTE" | "EN_PROCESO" | "EN_DESPACHO" | "COMPLETADO" | "CANCELADO";

export type OrderListItem = {
  id: string;
  customerName: string;
  status: OrderStatus;
  paymentType: string;
  total: number;
  discount: number;
  createdAt: string;
  itemsCount: number;
  debt: { status: string; amountPaid: number; amount: number } | null;
};

const PAYMENT_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia",
  YAPE: "Yape", PLIN: "Plin", CREDITO: "Crédito",
};

const STATUS_TABS: { value: OrderStatus | "TODOS"; label: string }[] = [
  { value: "TODOS",       label: "Todos"      },
  { value: "PENDIENTE",   label: "Pendiente"  },
  { value: "EN_PROCESO",  label: "En proceso" },
  { value: "EN_DESPACHO", label: "Despachado" },
  { value: "COMPLETADO",  label: "Completado" },
  { value: "CANCELADO",   label: "Cancelado"  },
];

export default function PedidosClient({ orders }: { orders: OrderListItem[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "TODOS">("TODOS");

  const filtered = orders.filter((o) => {
    const matchQuery = o.customerName.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "TODOS" || o.status === statusFilter;
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search + status tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 shrink-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={clsx(
                "text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap border transition-all",
                statusFilter === tab.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center text-slate-400">
          <Package size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Sin resultados</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map((order) => {
              const debt = order.debt;
              const debtPct = debt
                ? Math.min(100, (debt.amountPaid / debt.amount) * 100)
                : null;

              return (
                <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--brand-rose-light)" }}
                  >
                    <Package size={16} style={{ color: "var(--brand-rose)" }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate"
                      >
                        {order.customerName}
                      </Link>
                      <OrderStatusSelect orderId={order.id} current={order.status} />
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {PAYMENT_LABEL[order.paymentType]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {order.itemsCount} {order.itemsCount === 1 ? "producto" : "productos"} · {order.createdAt}
                    </p>

                    {debt && debtPct !== null && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${debtPct}%`,
                              background: debtPct >= 100 ? "#10B981" : "var(--brand-rose)",
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {debtPct >= 100 ? "Saldado" : `${debtPct.toFixed(0)}% pagado`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Total + link to detail */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="text-sm font-bold text-slate-900">S/ {order.total.toFixed(2)}</p>
                    {order.discount > 0 && (
                      <p className="text-[10px] text-slate-400">-S/ {order.discount.toFixed(2)} dto.</p>
                    )}
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-700"
                    >
                      Ver detalle →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
