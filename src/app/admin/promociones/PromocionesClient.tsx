"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff, Loader2, X, Pencil, Percent, Search, Tag } from "lucide-react";
import {
  createPromotionAction, updatePromotionAction, togglePromotionAction, deletePromotionAction,
  type PromotionRow, type ProductOption,
} from "./actions";

// ── helpers ───────────────────────────────────────────────────────────────────
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Perú usa UTC-5 fijo todo el año (sin horario de verano). Fijamos la zona
// para que las horas no dependan del navegador de quien las cargue o vea.
const PERU_TZ = "America/Lima";

// ISO (UTC) -> valor "YYYY-MM-DDTHH:mm" en hora de Perú para <input datetime-local>
function toLocalInput(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PERU_TZ, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour").replace("24", "00")}:${g("minute")}`;
}

function nowLocalInput(): string {
  return toLocalInput(new Date().toISOString());
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-PE", {
    timeZone: PERU_TZ,
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

type Status = { label: string; className: string };
function statusOf(p: PromotionRow): Status {
  const now = Date.now();
  if (!p.active) return { label: "Oculta", className: "bg-slate-100 text-slate-500" };
  if (new Date(p.endsAt).getTime() < now) return { label: "Expirada", className: "bg-amber-50 text-amber-600" };
  if (new Date(p.startsAt).getTime() > now) return { label: "Programada", className: "bg-indigo-50 text-indigo-600" };
  return { label: "En vivo", className: "bg-emerald-50 text-emerald-600" };
}

// ── modal shell ────────────────────────────────────────────────────────────────
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden max-h-[95svh] sm:max-h-[92vh] flex flex-col"
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ── product picker ──────────────────────────────────────────────────────────────
function ProductPicker({
  products, value, onChange,
}: { products: ProductOption[]; value: string; onChange: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = products.find((p) => p.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 30);
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 30);
  }, [products, query]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Producto <span className="text-rose-500">*</span>
      </label>
      {selected ? (
        <div className="flex items-center gap-3 p-2 border border-slate-200 rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {selected.image
            ? <img src={selected.image} alt={selected.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
            : <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{selected.name}</p>
            <p className="text-xs text-slate-400">S/ {selected.price.toFixed(2)} · {selected.category}</p>
          </div>
          <button type="button" onClick={() => { onChange(""); setOpen(true); }}
            className="text-xs font-medium text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50">
            Cambiar
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text" placeholder="Buscar producto…" value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
          />
          {open && (
            <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-sm text-slate-400">Sin resultados</p>
              ) : filtered.map((p) => (
                <button key={p.id} type="button"
                  onClick={() => { onChange(p.id); setOpen(false); setQuery(""); }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    : <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">S/ {p.price.toFixed(2)} · {p.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── shared form fields ──────────────────────────────────────────────────────────
function PromoFields({
  products, initial,
}: { products: ProductOption[]; initial?: PromotionRow }) {
  const [productId, setProductId] = useState(initial?.productId ?? "");
  const [discount, setDiscount] = useState<number>(initial?.discountPercent ?? 10);
  const selected = products.find((p) => p.id === productId);
  const preview = selected ? round2(selected.price * (1 - Math.min(Math.max(discount, 0), 99) / 100)) : null;

  return (
    <>
      <input type="hidden" name="productId" value={productId} />
      <ProductPicker products={products} value={productId} onChange={setProductId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Percent size={11} /> Descuento (%) <span className="text-rose-500">*</span>
          </label>
          <input
            name="discountPercent" type="number" min={1} max={99} required
            value={discount}
            onChange={(e) => setDiscount(parseInt(e.target.value || "0", 10))}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5 justify-end">
          {preview !== null && selected && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Precio con promo</p>
              <p className="text-sm">
                <span className="line-through text-slate-400 mr-2">S/ {selected.price.toFixed(2)}</span>
                <span className="font-black text-rose-600">S/ {preview.toFixed(2)}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inicio</label>
          <input
            name="startsAt" type="datetime-local"
            defaultValue={initial ? toLocalInput(initial.startsAt) : nowLocalInput()}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Fin <span className="text-rose-500">*</span>
          </label>
          <input
            name="endsAt" type="datetime-local" required
            defaultValue={initial ? toLocalInput(initial.endsAt) : ""}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
          />
        </div>
      </div>
    </>
  );
}

// ── create / edit modals ─────────────────────────────────────────────────────────
function PromoModal({
  mode, products, promotion, onClose, onSaved,
}: {
  mode: "create" | "edit";
  products: ProductOption[];
  promotion?: PromotionRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const action = mode === "create" ? createPromotionAction : updatePromotionAction;
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <ModalShell title={mode === "create" ? "Nueva promoción" : "Editar promoción"} onClose={onClose}>
      <form
        action={(fd) => {
          startTransition(async () => {
            // El servidor interpreta la hora de pared como Perú (UTC-5). No
            // convertimos aquí para no depender de la zona del navegador.
            const res = await action(null, fd);
            if (res && "error" in res && res.error) { setError(res.error); return; }
            setError(null);
            onSaved();
            onClose();
          });
        }}
        className="p-6 space-y-4 overflow-y-auto"
      >
        {mode === "edit" && promotion && <input type="hidden" name="id" value={promotion.id} />}
        <PromoFields products={products} initial={promotion} />
        {error && <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={pending}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "var(--brand-rose)" }}>
            {pending ? <><Loader2 size={14} className="animate-spin" /> Guardando…</> : mode === "create" ? "Crear promoción" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── main component ───────────────────────────────────────────────────────────────
export default function PromocionesClient({
  promotions: initial, products,
}: { promotions: PromotionRow[]; products: ProductOption[] }) {
  const [promotions, setPromotions] = useState<PromotionRow[]>(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<PromotionRow | null>(null);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    const { getPromotions } = await import("./actions");
    setPromotions(await getPromotions());
  }

  function handleToggle(id: string, current: boolean) {
    setPromotions((prev) => prev.map((p) => p.id === id ? { ...p, active: !current, isLive: false } : p));
    startTransition(async () => { await togglePromotionAction(id, !current); refresh(); });
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta promoción?")) return;
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    startTransition(() => deletePromotionAction(id));
  }

  const liveCount = promotions.filter((p) => statusOf(p).label === "En vivo").length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Promociones</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Aplica un descuento en porcentaje a un producto por un tiempo determinado. Las promociones en vivo aparecen en el home.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          disabled={products.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold self-start sm:self-auto disabled:opacity-50"
          style={{ background: "var(--brand-rose)" }}
        >
          <Plus size={15} />
          Nueva promoción
        </motion.button>
      </div>

      {liveCount > 0 && (
        <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          {liveCount} {liveCount === 1 ? "promoción activa" : "promociones activas"} en el home
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <PromoModal mode="create" products={products} onClose={() => setShowCreate(false)} onSaved={refresh} />
        )}
        {editing && (
          <PromoModal mode="edit" products={products} promotion={editing} onClose={() => setEditing(null)} onSaved={refresh} />
        )}
      </AnimatePresence>

      {/* List */}
      {promotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Tag size={40} strokeWidth={1.2} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">No hay promociones todavía</p>
          <p className="text-xs mt-1">Crea una para ofrecer descuentos en el home</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo, i) => {
            const status = statusOf(promo);
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="flex items-stretch">
                  {/* Image + discount badge */}
                  <div className="relative w-24 sm:w-32 shrink-0 bg-slate-100">
                    {promo.productImage
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={promo.productImage} alt={promo.productName} className="w-full h-full object-cover absolute inset-0" />
                      : <div className="w-full h-full bg-slate-100" />}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[11px] font-black text-white shadow"
                      style={{ background: "var(--brand-rose)" }}>
                      -{promo.discountPercent}%
                    </div>
                  </div>

                  {/* Info + actions */}
                  <div className="flex-1 min-w-0 px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 truncate">{promo.productName}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.className}`}>{status.label}</span>
                      </div>
                      <p className="text-sm mt-1">
                        <span className="line-through text-slate-400 mr-2">S/ {promo.productPrice.toFixed(2)}</span>
                        <span className="font-black text-rose-600">S/ {promo.discountedPrice.toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(promo.startsAt)} → {formatDate(promo.endsAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggle(promo.id, promo.active)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                        style={promo.active
                          ? { background: "var(--brand-rose-light)", borderColor: "var(--brand-rose)", color: "var(--brand-rose-dark)" }
                          : { background: "#F1F5F9", borderColor: "#CBD5E1", color: "#64748B" }}
                      >
                        {promo.active ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span className="hidden sm:inline">{promo.active ? "Activa" : "Oculta"}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setEditing(promo)}
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(promo.id)}
                        disabled={isPending}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
