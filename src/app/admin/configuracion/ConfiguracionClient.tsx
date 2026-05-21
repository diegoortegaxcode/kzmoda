"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Lock, CheckCircle2, Loader2, Phone, MapPin, Instagram, FileText } from "lucide-react";
import { updateStoreAction, changePasswordAction, type ActionResult } from "./actions";

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
    instagram: string; catalogTagline: string;
  };
}) {
  const [storeState, storeAction, storePending] = useActionState<ActionResult, FormData>(updateStoreAction, null);
  const [pwState, pwAction, pwPending] = useActionState<ActionResult, FormData>(changePasswordAction, null);

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
