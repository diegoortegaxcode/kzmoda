"use client";

import { useActionState, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, CheckCircle2, ImageIcon, X } from "lucide-react";
import { submitProofAction, type ProofResult } from "./actions";

const PAYMENT_TYPES = [
  { value: "YAPE", label: "Yape" },
  { value: "PLIN", label: "Plin" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "EFECTIVO", label: "Efectivo" },
];

export default function UploadProofForm({ debtId, maxAmount }: { debtId: string; maxAmount: number }) {
  const [state, formAction, pending] = useActionState<ProofResult, FormData>(submitProofAction, null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  if (state?.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center"
      >
        <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-3" />
        <p className="font-semibold text-emerald-800">¡Comprobante enviado!</p>
        <p className="text-sm text-emerald-600 mt-1">
          El administrador revisará tu comprobante y registrará el pago.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-rose-100 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Subir comprobante de pago</h2>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="debtId" value={debtId} />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Monto declarado (S/)
            </label>
            <input
              name="amount"
              type="number"
              required
              min="1"
              max={maxAmount}
              step="0.01"
              placeholder={`Máx. ${maxAmount.toFixed(2)}`}
              className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
            <p className="text-[10px] text-slate-400">Este monto será validado por el administrador antes de aplicarse a tu deuda.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Método de pago
            </label>
            <select
              name="paymentType"
              defaultValue="YAPE"
              className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-white"
            >
              {PAYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Image upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Imagen del comprobante
          </label>

          {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img src={preview} alt="Preview" className="w-full max-h-56 object-contain bg-slate-50" />
              <button
                type="button"
                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-36 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <ImageIcon size={24} />
              <span className="text-sm">Toca para seleccionar imagen</span>
              <span className="text-xs">JPG, PNG, WEBP — máx. 8 MB</span>
            </button>
          )}

          <input
            ref={fileRef}
            name="image"
            type="file"
            accept="image/*"
            capture="environment"
            required
            onChange={handleFile}
            className="hidden"
          />
        </div>

        {state?.error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs px-3 py-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100"
          >
            {state.error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white disabled:opacity-70 transition-all"
          style={{ background: "var(--brand-rose)" }}
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {pending ? "Subiendo…" : "Enviar comprobante"}
        </button>
      </form>
    </div>
  );
}
