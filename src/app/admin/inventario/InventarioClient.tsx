"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Package, AlertTriangle, TrendingUp, X, ArrowDownCircle,
  ArrowUpCircle, SlidersHorizontal, DollarSign, Boxes, FileDown, Loader2, Tag,
  ImagePlus, Link as LinkIcon, Pencil, Search,
} from "lucide-react";
import {
  createProductAction, adjustStockAction, createCategoryAction, toggleCategoryAction, updateProductAction,
  type ProductRow, type CategoryOption, type CategoryRow, type ActionResult,
} from "./actions";
import RichTextEditor from "./RichTextEditor";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function margin(price: number, cost: number) {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
}

function stockChip(stock: number, min: number) {
  if (stock === 0) return { label: "Sin stock", bg: "bg-rose-100", text: "text-rose-700" };
  if (stock <= min) return { label: "Stock bajo", bg: "bg-amber-100", text: "text-amber-700" };
  return { label: "En stock", bg: "bg-emerald-100", text: "text-emerald-700" };
}

function marginColor(pct: number) {
  if (pct >= 40) return "text-emerald-600";
  if (pct >= 20) return "text-amber-600";
  return "text-rose-600";
}

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ─── Field ───────────────────────────────────────────────────────────────────

function Field({
  label, name, type = "text", required, placeholder, min, step, children,
}: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; min?: string; step?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children ?? (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          min={min}
          step={step}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
        />
      )}
    </div>
  );
}

// ─── Add Product Modal ────────────────────────────────────────────────────────

function ProductModal({ categories, onClose }: { categories: CategoryOption[]; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createProductAction, null);
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPreview(e.target.value);
  }

  function clearImage() {
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-rose-light)" }}>
              <Package size={18} style={{ color: "var(--brand-rose)" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>Nuevo Producto</p>
              <p className="text-[10px] text-slate-400">Vinculado al catálogo</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form action={formAction} className="px-6 py-5 space-y-4 overflow-y-auto">
          {/* Image picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Imagen</label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => { setImageMode("file"); clearImage(); }}
                  className={`flex items-center gap-1 px-3 py-1 transition-colors ${imageMode === "file" ? "text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  style={imageMode === "file" ? { background: "var(--brand-rose)" } : {}}
                >
                  <ImagePlus size={11} />
                  Subir
                </button>
                <button
                  type="button"
                  onClick={() => { setImageMode("url"); clearImage(); }}
                  className={`flex items-center gap-1 px-3 py-1 transition-colors ${imageMode === "url" ? "text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  style={imageMode === "url" ? { background: "var(--brand-rose)" } : {}}
                >
                  <LinkIcon size={11} />
                  URL
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Preview */}
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 shrink-0 overflow-hidden flex items-center justify-center bg-slate-50">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" onError={() => setPreview("")} />
                ) : (
                  <ImagePlus size={20} className="text-slate-300" />
                )}
              </div>

              <div className="flex-1">
                {imageMode === "file" ? (
                  <>
                    <input
                      ref={fileInputRef}
                      name="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="imageFileInput"
                    />
                    <label
                      htmlFor="imageFileInput"
                      className="flex flex-col items-center justify-center w-full h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-[var(--brand-rose)] hover:bg-[var(--brand-rose-light)] transition-all cursor-pointer text-center"
                    >
                      {preview ? (
                        <span className="text-xs text-emerald-600 font-semibold">Imagen seleccionada ✓</span>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-slate-500">Clic para seleccionar</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP</span>
                        </>
                      )}
                    </label>
                  </>
                ) : (
                  <div className="flex flex-col gap-1 h-20 justify-center">
                    <input
                      name="imageUrl"
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      onChange={handleUrlChange}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
                    />
                    <p className="text-[10px] text-slate-400 px-1">Pega la URL directa de la imagen</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Nombre" name="name" required placeholder="Ej. Vestido Floral Rosa" />
            </div>
            <Field label="SKU" name="sku" required placeholder="VFR-001" />
            <Field label="Categoría" name="categoryId" required>
              {categories.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                  Sin categorías. Cierra este modal y crea una primero en "Categorías".
                </p>
              ) : (
                <select
                  name="categoryId"
                  required
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition bg-white"
                >
                  <option value="">Seleccionar…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Precio Costo (S/)" name="costPrice" type="number" required min="0.01" step="0.01" placeholder="0.00" />
            <Field label="Precio Venta (S/)" name="price" type="number" required min="0.01" step="0.01" placeholder="0.00" />
            <Field label="Stock Inicial" name="stock" type="number" min="0" placeholder="0" />
            <Field label="Stock Mínimo" name="minStock" type="number" min="0" placeholder="5" />
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</label>
              <input type="hidden" name="description" value={description} />
              <div className="mt-1">
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe materiales, tallas, cuidados, beneficios y recomendaciones…"
                />
              </div>
            </div>
          </div>

          {state?.error && (
            <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ background: "var(--brand-rose)" }}
            >
              {pending ? "Guardando…" : "Crear Producto"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ProductEditModal({
  product,
  categories,
  onClose,
}: {
  product: ProductRow;
  categories: CategoryOption[];
  onClose: () => void;
}) {
  const [saveState, setSaveState] = useState<ActionResult>(null);
  const [pending, startTransition] = useTransition();
  const [imageMode, setImageMode] = useState<"file" | "url">("url");
  const [preview, setPreview] = useState(product.image || "");
  const [description, setDescription] = useState(product.description || "");
  const [imageUrl, setImageUrl] = useState(product.image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (saveState?.success) onClose();
  }, [saveState?.success, onClose]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSaveState(null);
    startTransition(async () => {
      const result = await updateProductAction(null, formData);
      setSaveState(result);
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-rose-light)" }}>
              <Pencil size={16} style={{ color: "var(--brand-rose)" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>Editar producto</p>
              <p className="text-[10px] text-slate-400">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto">
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="currentImage" value={product.image} />
          <input type="hidden" name="description" value={description} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Imagen</label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`px-3 py-1 transition-colors ${imageMode === "url" ? "text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  style={imageMode === "url" ? { background: "var(--brand-rose)" } : {}}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("file")}
                  className={`px-3 py-1 transition-colors ${imageMode === "file" ? "text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  style={imageMode === "file" ? { background: "var(--brand-rose)" } : {}}
                >
                  Subir
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 shrink-0 overflow-hidden flex items-center justify-center bg-slate-50">
                {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <ImagePlus size={20} className="text-slate-300" />}
              </div>
              <div className="flex-1">
                {imageMode === "url" ? (
                  <div className="flex flex-col gap-1 h-20 justify-center">
                    <input
                      name="imageUrl"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setPreview(e.target.value);
                      }}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
                    />
                    <p className="text-[10px] text-slate-400 px-1">Mantén vacío para conservar imagen actual</p>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      name="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="editImageFileInput"
                    />
                    <label
                      htmlFor="editImageFileInput"
                      className="flex flex-col items-center justify-center w-full h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-[var(--brand-rose)] hover:bg-[var(--brand-rose-light)] transition-all cursor-pointer text-center"
                    >
                      <span className="text-xs font-semibold text-slate-500">Seleccionar nueva imagen</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Nombre" name="name" required placeholder="Ej. Vestido Floral Rosa">
                <input
                  name="name"
                  defaultValue={product.name}
                  required
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
                />
              </Field>
            </div>
            <Field label="SKU" name="sku" required>
              <input
                name="sku"
                defaultValue={product.sku}
                required
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
              />
            </Field>
            <Field label="Categoría" name="categoryId" required>
              <select
                name="categoryId"
                required
                defaultValue={product.categoryId}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Precio Costo (S/)" name="costPrice" type="number" required min="0.01" step="0.01">
              <input
                name="costPrice"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={product.costPrice}
                required
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
              />
            </Field>
            <Field label="Precio Venta (S/)" name="price" type="number" required min="0.01" step="0.01">
              <input
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={product.price}
                required
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
              />
            </Field>
            <Field label="Stock Mínimo" name="minStock" type="number" min="0">
              <input
                name="minStock"
                type="number"
                min="0"
                defaultValue={product.minStock}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
              />
            </Field>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</label>
              <div className="mt-1">
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe materiales, tallas, cuidados, beneficios y recomendaciones…"
                />
              </div>
            </div>
          </div>

          {saveState?.error && (
            <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{saveState.error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ background: "var(--brand-rose)" }}
            >
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Adjust Stock Slide-over ──────────────────────────────────────────────────

const MOVE_TYPES = [
  { value: "ENTRADA", label: "Entrada", icon: ArrowDownCircle, color: "emerald" },
  { value: "SALIDA", label: "Salida", icon: ArrowUpCircle, color: "rose" },
  { value: "AJUSTE", label: "Ajuste", icon: SlidersHorizontal, color: "amber" },
] as const;

function StockModal({ product, onClose }: { product: ProductRow; onClose: () => void }) {
  const [type, setType] = useState<"ENTRADA" | "SALIDA" | "AJUSTE">("ENTRADA");
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(adjustStockAction, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  const typeInfo = MOVE_TYPES.find((t) => t.value === type)!;

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
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>
              Ajuste de Stock
            </p>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400">Producto</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{product.name}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-mono text-slate-400">{product.sku}</span>
              <span className="text-[10px] text-slate-400">Stock actual:</span>
              <span className="text-xs font-bold" style={{ color: product.stock === 0 ? "var(--brand-rose)" : "var(--brand-black)" }}>
                {product.stock} uds.
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form action={formAction} className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="type" value={type} />

          {/* Type selector */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipo de movimiento</p>
            <div className="grid grid-cols-3 gap-2">
              {MOVE_TYPES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                    type === value
                      ? color === "emerald"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : color === "rose"
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>
            {type === "AJUSTE" && (
              <p className="text-[10px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mt-2">
                El stock se fijará exactamente al valor ingresado.
              </p>
            )}
          </div>

          <Field
            label={type === "AJUSTE" ? "Nuevo stock total" : "Cantidad"}
            name="qty"
            type="number"
            required
            min="0"
            placeholder="0"
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notas</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Motivo del movimiento (opcional)…"
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition resize-none"
            />
          </div>

          {state?.error && (
            <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                type === "ENTRADA" ? "bg-emerald-500" : type === "SALIDA" ? "" : "bg-amber-500"
              }`}
              style={type === "SALIDA" ? { background: "var(--brand-rose)" } : undefined}
            >
              <typeInfo.icon size={15} strokeWidth={2.5} />
              {pending ? "Guardando…" : `Registrar ${typeInfo.label}`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Category Modal ───────────────────────────────────────────────────────────

function CategoryModal({ allCategories, onClose }: { allCategories: CategoryRow[]; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createCategoryAction, null);
  const [, startTransition] = useTransition();
  const [toggling, setToggling] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  function handleToggle(id: string, active: boolean) {
    setToggling(id);
    startTransition(async () => {
      await toggleCategoryAction(id, active);
      setToggling(null);
    });
  }

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
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-rose-light)" }}>
              <Tag size={18} style={{ color: "var(--brand-rose)" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>Categorías</p>
              <p className="text-[10px] text-slate-400">{allCategories.length} registradas</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* New category form */}
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Nueva categoría</p>
          <form ref={formRef} action={formAction} className="flex gap-2">
            <input
              name="name"
              required
              placeholder="Ej. Vestidos, Accesorios…"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-60 shrink-0"
              style={{ background: "var(--brand-rose)" }}
            >
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} strokeWidth={2.5} />}
            </button>
          </form>
          {state?.error && (
            <p className="text-xs text-rose-600 mt-2 bg-rose-50 px-3 py-1.5 rounded-lg">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-xs text-emerald-600 mt-2 bg-emerald-50 px-3 py-1.5 rounded-lg">Categoría creada.</p>
          )}
        </div>

        {/* Categories list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {allCategories.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Sin categorías aún. Agrega la primera.</p>
          )}
          {allCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cat.active ? "bg-emerald-400" : "bg-slate-300"}`} />
                <span className="text-sm font-medium text-slate-800">{cat.name}</span>
              </div>
              <button
                disabled={toggling === cat.id}
                onClick={() => handleToggle(cat.id, cat.active)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all min-w-[56px] text-center ${
                  cat.active
                    ? "bg-emerald-100 text-emerald-700 hover:bg-rose-100 hover:text-rose-700"
                    : "bg-slate-200 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700"
                }`}
              >
                {toggling === cat.id ? "…" : cat.active ? "Activa" : "Inactiva"}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InventarioClient({
  products,
  categories,
  allCategories,
}: {
  products: ProductRow[];
  categories: CategoryOption[];
  allCategories: CategoryRow[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [adjusting, setAdjusting] = useState<ProductRow | null>(null);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const searchDebounced = useDebounce(search, 280);

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      const res = await fetch("/api/catalog/pdf");
      if (!res.ok) throw new Error("Error generando PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `catalogo-kmoda-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }

  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.costPrice, 0);
  const filteredProducts = products.filter((p) => {
    const q = searchDebounced.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>
              Inventario
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{totalProducts} productos registrados</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-60"
              style={{ borderColor: "var(--brand-gold)", color: "var(--brand-gold-dark)" }}
            >
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
              {downloading ? "Generando…" : "Catálogo PDF"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCategories(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <Tag size={15} />
              Categorías
              {allCategories.length === 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md"
              style={{ background: "var(--brand-rose)", boxShadow: "0 4px 14px rgba(233,30,99,0.3)" }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Añadir Producto
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Productos", value: totalProducts, icon: Package, color: "indigo", prefix: "" },
            { label: "Stock Bajo", value: lowStock, icon: AlertTriangle, color: "amber", prefix: "" },
            { label: "Sin Stock", value: outOfStock, icon: Boxes, color: "rose", prefix: "" },
            { label: "Valor Inventario", value: inventoryValue.toFixed(0), icon: DollarSign, color: "emerald", prefix: "S/ " },
          ].map(({ label, value, icon: Icon, color, prefix }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 px-4 py-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                color === "indigo" ? "bg-indigo-50" : color === "amber" ? "bg-amber-50" : color === "rose" ? "bg-rose-50" : "bg-emerald-50"
              }`}>
                <Icon size={18} className={
                  color === "indigo" ? "text-indigo-500" : color === "amber" ? "text-amber-500" : color === "rose" ? "text-rose-500" : "text-emerald-500"
                } strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                <p className="text-xl font-black text-slate-900 leading-tight">{prefix}{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, SKU o categoría…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Imagen", "Producto", "SKU", "Stock", "P. Costo", "P. Venta", "Margen", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-sm text-slate-400">
                      No encontramos productos para la búsqueda actual.
                    </td>
                  </tr>
                )}
                {filteredProducts.map((p) => {
                  const chip = stockChip(p.stock, p.minStock);
                  const mgn = margin(p.price, p.costPrice);
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Imagen */}
                      <td className="px-4 py-3.5">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300">
                            <ImagePlus size={14} />
                          </div>
                        )}
                      </td>
                      {/* Producto */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {p.category}
                        </span>
                      </td>
                      {/* SKU */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">{p.sku}</span>
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900">{p.stock}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${chip.bg} ${chip.text}`}>
                            {chip.label}
                          </span>
                        </div>
                      </td>
                      {/* Costo */}
                      <td className="px-4 py-3.5 text-slate-500 tabular-nums">
                        S/ {p.costPrice.toFixed(2)}
                      </td>
                      {/* Venta */}
                      <td className="px-4 py-3.5 font-bold text-slate-900 tabular-nums">
                        S/ {p.price.toFixed(2)}
                      </td>
                      {/* Margen */}
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-black tabular-nums ${marginColor(mgn)}`}>
                          {mgn.toFixed(1)}%
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditing(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            <Pencil size={12} strokeWidth={2.5} />
                            Editar
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAdjusting(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:border-[var(--brand-rose)] hover:text-[var(--brand-rose)] hover:bg-[var(--brand-rose-light)] transition-all"
                          >
                            <SlidersHorizontal size={12} strokeWidth={2.5} />
                            Ajuste
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Margin legend */}
        <div className="flex items-center gap-6 text-[10px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5"><TrendingUp size={11} className="text-emerald-500" /> Margen ≥ 40% — bueno</div>
          <div className="flex items-center gap-1.5"><TrendingUp size={11} className="text-amber-500" /> 20–40% — regular</div>
          <div className="flex items-center gap-1.5"><TrendingUp size={11} className="text-rose-500" /> &lt; 20% — bajo</div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showCategories && (
          <CategoryModal
            key="category-modal"
            allCategories={allCategories}
            onClose={() => setShowCategories(false)}
          />
        )}
        {showAdd && (
          <ProductModal
            key="product-modal"
            categories={categories}
            onClose={() => setShowAdd(false)}
          />
        )}
        {editing && (
          <ProductEditModal
            key="product-edit-modal"
            product={editing}
            categories={categories}
            onClose={() => setEditing(null)}
          />
        )}
        {adjusting && (
          <StockModal
            key="stock-modal"
            product={adjusting}
            onClose={() => setAdjusting(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
