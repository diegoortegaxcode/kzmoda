"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, UserPlus, Mail, Phone, CreditCard, X, Users, ShieldCheck, ShieldOff, Search } from "lucide-react";
import { createCustomerAction, toggleCustomerAction, type CustomerRow, type ActionResult } from "./actions";

function CustomerModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createCustomerAction, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25 }}
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden"
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-rose-light)" }}>
              <UserPlus size={17} style={{ color: "var(--brand-rose)" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>Nuevo Cliente</p>
              <p className="text-[10px] text-slate-400">Agrega al registro de clientes</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form action={formAction} className="px-6 py-5 space-y-4">
          {[
            { label: "Nombre completo", name: "name", required: true, placeholder: "Ej. María García López" },
            { label: "Email", name: "email", type: "email", placeholder: "correo@ejemplo.com" },
            { label: "Teléfono", name: "phone", placeholder: "+51 999 000 000" },
            { label: "DNI", name: "dni", placeholder: "12345678" },
          ].map(({ label, name, type = "text", required, placeholder }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
              </label>
              <input
                name={name}
                type={type}
                required={required}
                placeholder={placeholder}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Límite de crédito (S/)</label>
            <input
              name="creditLimit"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              placeholder="0.00"
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notas</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Observaciones opcionales…"
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition resize-none"
            />
          </div>

          {state?.error && (
            <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ background: "var(--brand-rose)" }}
            >
              {pending ? "Guardando…" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ClientesClient({ customers }: { customers: CustomerRow[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const active = customers.filter((c) => c.active).length;
  const filtered = query.trim()
    ? customers.filter((c) =>
        [c.name, c.email ?? "", c.phone ?? "", c.dni ?? ""]
          .some((v) => v.toLowerCase().includes(query.toLowerCase()))
      )
    : customers;

  function handleToggle(id: string) {
    startTransition(() => toggleCustomerAction(id));
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>Clientes</h1>
            <p className="text-xs text-slate-400 mt-0.5">{active} activos · {customers.length} total</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md"
            style={{ background: "var(--brand-rose)", boxShadow: "0 4px 14px rgba(233,30,99,0.3)" }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Nuevo Cliente
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email, teléfono o DNI…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total clientes", value: customers.length, icon: Users, colorClass: "bg-indigo-50 text-indigo-500" },
            { label: "Con pedidos", value: customers.filter((c) => c.ordersCount > 0).length, icon: CreditCard, colorClass: "bg-emerald-50 text-emerald-500" },
            { label: "Con deudas", value: customers.filter((c) => c.debtsCount > 0).length, icon: CreditCard, colorClass: "bg-rose-50 text-rose-500" },
          ].map(({ label, value, icon: Icon, colorClass }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400">{label}</p>
                <p className="text-xl font-black text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Cliente", "Contacto", "DNI", "Crédito", "Pedidos", "Estado", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-slate-400">
                      {query ? "Sin resultados para esa búsqueda." : "Sin clientes registrados. Añade el primero."}
                    </td>
                  </tr>
                )}
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Nombre */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: `hsl(${(i * 47) % 360}, 60%, 55%)` }}
                        >
                          {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </div>
                        <p className="font-semibold text-slate-900 truncate max-w-[160px]">{c.name}</p>
                      </div>
                    </td>
                    {/* Contacto */}
                    <td className="px-4 py-3.5 text-slate-500">
                      <div className="flex flex-col gap-0.5">
                        {c.email && (
                          <div className="flex items-center gap-1 text-xs"><Mail size={11} />{c.email}</div>
                        )}
                        {c.phone && (
                          <div className="flex items-center gap-1 text-xs text-slate-400"><Phone size={11} />{c.phone}</div>
                        )}
                        {!c.email && !c.phone && <span className="text-xs text-slate-300">—</span>}
                      </div>
                    </td>
                    {/* DNI */}
                    <td className="px-4 py-3.5">
                      {c.dni
                        ? <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">{c.dni}</span>
                        : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    {/* Crédito */}
                    <td className="px-4 py-3.5 tabular-nums text-slate-700 font-semibold">
                      {c.creditLimit > 0 ? `S/ ${c.creditLimit.toFixed(0)}` : <span className="text-slate-300">—</span>}
                    </td>
                    {/* Pedidos */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-sm font-bold text-slate-700">{c.ordersCount}</span>
                    </td>
                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        {c.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {/* Acción */}
                    <td className="px-4 py-3.5">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggle(c.id)}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:border-slate-300 transition-all opacity-0 group-hover:opacity-100"
                      >
                        {c.active ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                        {c.active ? "Desactivar" : "Activar"}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showAdd && <CustomerModal key="customer-modal" onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </>
  );
}
