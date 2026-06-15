"use client";

import { useActionState, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Lock, CheckCircle2, Loader2, Phone, MapPin, Instagram, FileText, Tag, Plus, X } from "lucide-react";
import { updateStoreAction, changePasswordAction, addSkuPrefixAction, removeSkuPrefixAction, type ActionResult } from "./actions";

function Field({
  label, name, defaultValue = "", placeholder = "", type = "text", icon: Icon, hint,
}: {
  label: string; name: string; defaultValue?: string;
  placeholder?: string; type?: string;
  icon?: React.ElementType; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full text-sm border border-slate-200 rounded-xl py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition bg-white"
          style={{ paddingLeft: Icon ? "2.25rem" : "0.75rem", paddingRight: "0.75rem" }}
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

function ResultBanner({ state }: { state: ActionResult }) {
  if (!state) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
          state.success ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
        }`}
      >
        {state.success ? <CheckCircle2 size={15} /> : null}
        {state.success ? "Guardado correctamente." : state.error}
      </motion.div>
    </AnimatePresence>
  );
}

function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function ConfiguracionClient({
  settings,
}: {
  settings: {
    name: string; whatsapp: string; address: string;
    instagram: string; catalogTagline: string; skuPrefixes: string[];
  };
}) {
  const [storeState, storeAction, storePending] = useActionState<ActionResult, FormData>(updateStoreAction, null);
  const [pwState, pwAction, pwPending] = useActionState<ActionResult, FormData>(changePasswordAction, null);
  const [prefixes, setPrefixes] = useState<string[]>(settings.skuPrefixes);
  const [prefixInput, setPrefixInput] = useState("");
  const [prefixError, setPrefixError] = useState("");
  const [prefixPending, setPrefixPending] = useState(false);

  async function handleAddPrefix() {
    const clean = prefixInput.trim();
    if (!clean) return;
    setPrefixPending(true);
    const res = await addSkuPrefixAction(clean);
    setPrefixPending(false);
    if (res?.error) { setPrefixError(res.error); return; }
    setPrefixes((prev) => [...prev, clean]);
    setPrefixInput("");
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-0.5">Ajustes generales de la tienda</p>
      </div>

      {/* ── Información de la tienda ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Store size={15} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Información de la tienda</p>
            <p className="text-[10px] text-slate-400">Se usa en el catálogo PDF y el portal del cliente</p>
          </div>
        </div>

        <form action={storeAction} className="px-5 py-5 space-y-4">
          <Field
            label="Nombre de la tienda"
            name="name"
            defaultValue={settings.name}
            placeholder="K Moda y Estilo"
          />
          <Field
            label="WhatsApp"
            name="whatsapp"
            defaultValue={settings.whatsapp}
            placeholder="992 032 988"
            icon={Phone}
            hint="Número que aparece en el catálogo PDF"
          />
          <Field
            label="Dirección"
            name="address"
            defaultValue={settings.address}
            placeholder="Jr. Ejemplo 123, Lima"
            icon={MapPin}
          />
          <Field
            label="Instagram"
            name="instagram"
            defaultValue={settings.instagram}
            placeholder="@kmodayestilo"
            icon={Instagram}
          />
          <Field
            label="Tagline del catálogo"
            name="catalogTagline"
            defaultValue={settings.catalogTagline}
            placeholder="Catálogo Oficial de Productos"
            icon={FileText}
            hint="Subtítulo que aparece en la portada del PDF"
          />

          <div className="flex items-center justify-between pt-2">
            <ResultBanner state={storeState} />
            <div className="ml-auto">
              <SubmitButton pending={storePending} label="Guardar cambios" pendingLabel="Guardando…" />
            </div>
          </div>
        </form>
      </motion.div>

      {/* ── Prefijos de SKU ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
            <Tag size={15} className="text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Prefijos de SKU</p>
            <p className="text-[10px] text-slate-400">Al crear productos podrás elegir el prefijo desde un select</p>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Current prefixes */}
          <div className="flex flex-wrap gap-2 min-h-[36px]">
            {prefixes.length === 0 && (
              <p className="text-xs text-slate-400 italic">Sin prefijos configurados</p>
            )}
            {prefixes.map((p) => (
              <motion.span
                key={p}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                style={{ background: "var(--brand-rose-light)", borderColor: "var(--brand-rose)", color: "var(--brand-rose-dark)" }}
              >
                {p}
                <button
                  type="button"
                  onClick={async () => {
                    setPrefixes((prev) => prev.filter((x) => x !== p));
                    await removeSkuPrefixAction(p);
                  }}
                  className="hover:text-rose-700 transition-colors"
                >
                  <X size={11} />
                </button>
              </motion.span>
            ))}
          </div>

          {/* Add prefix */}
          <div className="flex gap-2">
            <input
              value={prefixInput}
              onChange={(e) => { setPrefixInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setPrefixError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddPrefix(); }}}
              placeholder="Ej. SKU, IJU, KMD"
              maxLength={6}
              className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 font-mono uppercase transition"
            />
            <button
              type="button"
              disabled={prefixPending || !prefixInput}
              onClick={handleAddPrefix}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50 shrink-0"
              style={{ background: "var(--brand-rose)" }}
            >
              {prefixPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />}
            </button>
          </div>
          {prefixError && <p className="text-xs text-rose-600">{prefixError}</p>}
          <p className="text-[10px] text-slate-400">2-6 caracteres. Ej: <span className="font-mono">SKU</span>, <span className="font-mono">IJU</span>, <span className="font-mono">KMD</span></p>
        </div>
      </motion.div>

      {/* ── Seguridad ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <Lock size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Cambiar contraseña</p>
            <p className="text-[10px] text-slate-400">Solo afecta tu cuenta actual de administrador</p>
          </div>
        </div>

        <form action={pwAction} className="px-5 py-5 space-y-4">
          <Field label="Contraseña actual" name="current" type="password" placeholder="••••••••" />
          <Field label="Nueva contraseña" name="next" type="password" placeholder="Mínimo 6 caracteres" />
          <Field label="Confirmar nueva contraseña" name="confirm" type="password" placeholder="Repite la nueva contraseña" />

          <div className="flex items-center justify-between pt-2">
            <ResultBanner state={pwState} />
            <div className="ml-auto">
              <SubmitButton pending={pwPending} label="Cambiar contraseña" pendingLabel="Cambiando…" />
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
