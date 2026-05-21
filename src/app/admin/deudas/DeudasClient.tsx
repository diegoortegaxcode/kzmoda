"use client";

import { useActionState, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Banknote, Search } from "lucide-react";
import DebtPanel from "@/components/DebtPanel";
import type { DebtPanelRow } from "@/components/DebtPanel";
import { registerPaymentAction, type DebtDetail, type ActionResult } from "./actions";

const PAYMENT_TYPES = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "YAPE", label: "Yape" },
  { value: "PLIN", label: "Plin" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
] as const;

function PaymentModal({ debt, onClose }: { debt: DebtDetail; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(registerPaymentAction, null);
  const [paymentType, setPaymentType] = useState<string>("EFECTIVO");

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  const remaining = debt.remaining;

  return (
    <div className="fixed inset-0 z-[200] flex">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="w-full max-w-sm bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-rose-light)" }}>
                <Banknote size={17} style={{ color: "var(--brand-rose)" }} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>Registrar Pago</p>
                <p className="text-[10px] text-slate-400">Actualiza el saldo de la deuda</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Debt summary */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Cliente</span>
              <span className="text-xs font-bold text-slate-900">{debt.customer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Deuda total</span>
              <span className="text-xs font-semibold text-slate-700">S/ {debt.amount.toLocaleString("es-PE")}</span>
            </div>
            {debt.amountPaid > 0 && (
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Ya pagado</span>
                <span className="text-xs font-semibold text-emerald-600">S/ {debt.amountPaid.toLocaleString("es-PE")}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700">Saldo pendiente</span>
              <span className="text-sm font-black" style={{ color: "var(--brand-rose)" }}>
                S/ {remaining.toLocaleString("es-PE")}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form action={formAction} className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
          <input type="hidden" name="debtId" value={debt.id} />
          <input type="hidden" name="paymentType" value={paymentType} />

          {/* Payment type */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Método de pago</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentType(value)}
                  className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                    paymentType === value
                      ? "border-[var(--brand-rose)] text-[var(--brand-rose)] bg-[var(--brand-rose-light)]"
                      : "border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monto a pagar (S/) <span className="text-rose-500">*</span>
            </label>
            <input
              name="amount"
              type="number"
              required
              min="0.01"
              max={remaining}
              step="0.01"
              placeholder={remaining.toFixed(2)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
            />
            <button
              type="button"
              className="text-left text-[10px] font-semibold mt-1 transition-colors hover:underline"
              style={{ color: "var(--brand-rose)" }}
              onClick={(e) => {
                const input = (e.currentTarget.closest("div")?.querySelector("input[name=amount]") as HTMLInputElement);
                if (input) input.value = remaining.toFixed(2);
              }}
            >
              Pagar saldo completo (S/ {remaining.toFixed(2)})
            </button>
          </div>

          {/* Reference (only for TRANSFERENCIA) */}
          <AnimatePresence>
            {paymentType === "TRANSFERENCIA" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-1 overflow-hidden"
              >
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">N° de operación</label>
                <input
                  name="reference"
                  type="text"
                  placeholder="Ej. OP-1234567"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {state?.error && (
            <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "var(--brand-rose)" }}
            >
              <Banknote size={15} />
              {pending ? "Registrando…" : "Registrar Pago"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function DeudasClient({
  rows,
  totalRemaining,
  totalInMora,
}: {
  rows: DebtDetail[];
  totalRemaining: number;
  totalInMora: number;
}) {
  const [paying, setPaying] = useState<DebtDetail | null>(null);
  const [query, setQuery] = useState("");

  const filteredRows = query.trim()
    ? rows.filter((r) => r.customer.toLowerCase().includes(query.toLowerCase()))
    : rows;

  function handlePagar(debt: DebtPanelRow) {
    const detail = rows.find((r) => r.id === debt.id);
    if (detail) setPaying(detail);
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div>
          <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>Deudas</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            S/ {totalRemaining.toLocaleString("es-PE")} pendiente · {rows.length} deuda{rows.length !== 1 ? "s" : ""} activa{rows.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
          />
        </div>

        {/* Summary chips */}
        {totalInMora > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <p className="text-xs font-semibold text-rose-700">
              S/ {totalInMora.toLocaleString("es-PE")} en mora — requiere atención
            </p>
          </div>
        )}

        <DebtPanel debts={filteredRows} onPagar={handlePagar} />
      </main>

      <AnimatePresence>
        {paying && (
          <PaymentModal key="payment-modal" debt={paying} onClose={() => setPaying(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
