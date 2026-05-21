"use client";

import { useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search, Plus, Minus, X, Package, User, ChevronDown,
  Loader2, CheckCircle2, ShoppingCart, Calendar,
} from "lucide-react";
import { createOrderAction } from "./actions";
import clsx from "clsx";

interface Customer { id: string; name: string; email: string | null; phone: string | null }
interface Product  { id: string; name: string; sku: string; price: number; stock: number; images: string[]; category: { name: string } }
interface LineItem  { productId: string; name: string; sku: string; qty: number; unitPrice: number; stock: number; image: string | null }

const PAYMENT_TYPES = [
  { value: "EFECTIVO",      label: "Efectivo" },
  { value: "YAPE",          label: "Yape" },
  { value: "PLIN",          label: "Plin" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "CREDITO",       label: "Crédito" },
] as const;

const STATUS_STYLE: Record<string, string> = {
  EFECTIVO:      "bg-emerald-50 text-emerald-700",
  YAPE:          "bg-violet-50 text-violet-700",
  PLIN:          "bg-blue-50 text-blue-700",
  TRANSFERENCIA: "bg-sky-50 text-sky-700",
  CREDITO:       "bg-amber-50 text-amber-700",
};

function CustomerCombobox({ customers, selected, onSelect, initialQuery }: {
  customers: Customer[];
  selected: Customer | null;
  onSelect: (c: Customer) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.includes(query) ||
        c.email?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : customers.slice(0, 8);

  if (selected) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: "var(--brand-rose)" }}>
          {selected.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{selected.name}</p>
          {selected.phone && <p className="text-xs text-slate-500">{selected.phone}</p>}
        </div>
        <button onClick={() => onSelect(null!)} className="text-slate-400 hover:text-rose-500 transition-colors">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar cliente por nombre, teléfono o email…"
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
        />
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
          >
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  onMouseDown={() => { onSelect(c); setQuery(""); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ background: "var(--brand-rose)" }}>
                    {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                    {c.phone && <p className="text-xs text-slate-400">{c.phone}</p>}
                  </div>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductSearch({ products, addedIds, onAdd, initialQuery }: {
  products: Product[];
  addedIds: Set<string>;
  onAdd: (p: Product) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");

  const filtered = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 12)
    : products.slice(0, 12);

  return (
    <div>
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o SKU…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
        />
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        {filtered.map((p) => {
          const added = addedIds.has(p.id);
          return (
            <div key={p.id} className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all",
              added ? "border-emerald-200 bg-emerald-50" : "border-slate-100 hover:border-rose-200 hover:bg-rose-50/40"
            )}>
              {p.images[0] ? (
                <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-100" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Package size={14} className="text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-400">{p.sku} · {p.category.name}</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">S/ {p.price.toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={clsx("text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  p.stock <= 3 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
                )}>
                  {p.stock} en stock
                </span>
                <button
                  onClick={() => onAdd(p)}
                  disabled={added}
                  className={clsx(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all text-white",
                    added ? "bg-emerald-400 cursor-default" : "bg-[var(--brand-rose)] hover:opacity-90"
                  )}
                >
                  {added ? <CheckCircle2 size={13} /> : <Plus size={13} />}
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-6">Sin resultados</p>
        )}
      </div>
    </div>
  );
}

export default function NuevoPedidoClient({
  customers,
  products,
  initialCustomerQuery,
  initialProductQuery,
}: {
  customers: Customer[];
  products: Product[];
  initialCustomerQuery?: string;
  initialProductQuery?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [paymentType, setPaymentType] = useState("EFECTIVO");
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const addedIds = new Set(items.map((i) => i.productId));
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const discountAmt = Math.min(Math.max(discount, 0), subtotal);
  const total = subtotal - discountAmt;
  const paidAmountSafe = Math.min(Math.max(paidAmount, 0), total);
  const pendingAmount = Math.max(total - paidAmountSafe, 0);

  function handleAddProduct(p: Product) {
    setItems((prev) => {
      if (prev.find((i) => i.productId === p.id)) return prev;
      return [...prev, { productId: p.id, name: p.name, sku: p.sku, qty: 1, unitPrice: p.price, stock: p.stock, image: p.images[0] ?? null }];
    });
  }

  function handleQty(productId: string, delta: number) {
    setItems((prev) => prev.map((i) => i.productId === productId
      ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.stock)) }
      : i
    ));
  }

  function handlePrice(productId: string, val: string) {
    const v = parseFloat(val);
    if (isNaN(v) || v < 0) return;
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, unitPrice: v } : i));
  }

  function handleRemove(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function handleSubmit() {
    if (!selectedCustomer) { setError("Selecciona un cliente."); return; }
    if (!items.length) { setError("Agrega al menos un producto."); return; }
    if (pendingAmount > 0 && paymentType === "CREDITO" && !dueDate) {
      setError("Selecciona una fecha de vencimiento para el saldo pendiente.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await createOrderAction({
        customerId: selectedCustomer.id,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty, unitPrice: i.unitPrice })),
        paymentType,
        discount: discountAmt,
        paidAmount: paidAmountSafe,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/pedidos");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
      {/* ── Left column ─────────────────────────────── */}
      <div className="lg:col-span-7 space-y-5">
        {/* Cliente */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Cliente</p>
          <CustomerCombobox
            customers={customers}
            selected={selectedCustomer}
            onSelect={setSelectedCustomer}
            initialQuery={initialCustomerQuery}
          />
        </div>

        {/* Productos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Buscar productos</p>
          <ProductSearch
            products={products}
            addedIds={addedIds}
            onAdd={handleAddProduct}
            initialQuery={initialProductQuery}
          />
        </div>

        {/* Items seleccionados */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Productos en el pedido</p>
            {items.length > 0 && (
              <span className="text-xs font-semibold text-[var(--brand-rose)] bg-[var(--brand-rose-light)] px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? "producto" : "productos"}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-300">
              <ShoppingCart size={32} className="mx-auto mb-2" />
              <p className="text-sm">Sin productos aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                      <Package size={14} className="text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleQty(item.productId, -1)}
                          className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors">
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                        <button onClick={() => handleQty(item.productId, 1)}
                          className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors">
                          <Plus size={10} />
                        </button>
                      </div>
                      <span className="text-slate-300 text-xs">×</span>
                      {/* Unit price editable */}
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px] text-slate-400">S/</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={item.unitPrice}
                          onChange={(e) => handlePrice(item.productId, e.target.value)}
                          className="w-16 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[var(--brand-rose)] bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900">S/ {(item.qty * item.unitPrice).toFixed(2)}</p>
                    <button onClick={() => handleRemove(item.productId)}
                      className="text-slate-300 hover:text-rose-400 transition-colors mt-1">
                      <X size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right column ────────────────────────────── */}
      <div className="lg:col-span-5 space-y-4">
        {/* Resumen */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Resumen</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Descuento</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400">S/</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-20 text-sm font-semibold text-right border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[var(--brand-rose)] text-slate-800"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Pagó ahora</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400">S/</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-20 text-sm font-semibold text-right border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[var(--brand-rose)] text-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Saldo pendiente</span>
              <span className={clsx("font-semibold", pendingAmount > 0 ? "text-rose-600" : "text-emerald-600")}>
                S/ {pendingAmount.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-lg font-black text-slate-900">S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Tipo de pago */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Tipo de pago</p>
          <div className="grid grid-cols-3 gap-1.5">
            {PAYMENT_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPaymentType(value)}
                className={clsx(
                  "py-2 rounded-xl text-xs font-semibold border transition-all",
                  paymentType === value
                    ? "border-[var(--brand-rose)] text-[var(--brand-rose)] bg-[var(--brand-rose-light)]"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {pendingAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    <Calendar size={12} />
                    Fecha de vencimiento {paymentType === "CREDITO" ? "(requerida)" : "(opcional)"}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
                  />
                  <p className="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg mt-1">
                    Se creará una deuda por el saldo pendiente: S/ {pendingAmount.toFixed(2)}.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Notas del pedido</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Ej: cliente pagó 50% adelanto, entrega el lunes…"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition resize-none"
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm px-4 py-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          whileHover={isPending ? {} : { scale: 1.01 }}
          whileTap={isPending ? {} : { scale: 0.99 }}
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 text-white disabled:opacity-60 transition-all shadow-lg"
          style={{ background: isPending ? "#ccc" : "linear-gradient(135deg, var(--brand-rose), var(--brand-rose-dark))" }}
        >
          {isPending ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
          {isPending ? "Creando pedido…" : "Confirmar pedido"}
        </motion.button>
      </div>
    </div>
  );
}
