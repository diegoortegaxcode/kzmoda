"use client";

import { useActionState, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ExternalLink, Loader2, FileCheck, Clock, Search } from "lucide-react";
import { approveProofAction, rejectProofAction, type ProofRow, type ActionResult } from "./actions";

const PAYMENT_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  YAPE: "Yape",
  PLIN: "Plin",
  CREDITO: "Crédito",
};

function ProofCard({ proof, onProcessed }: { proof: ProofRow; onProcessed: (id: string, status: "APROBADO" | "RECHAZADO") => void }) {
  const [approveState, approveAction, approvePending] = useActionState<ActionResult, FormData>(approveProofAction, null);
  const [rejectState, rejectAction, rejectPending] = useActionState<ActionResult, FormData>(rejectProofAction, null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [validatedAmount, setValidatedAmount] = useState(proof.amount.toFixed(2));

  useEffect(() => {
    if (approveState?.success) onProcessed(proof.id, "APROBADO");
  }, [approveState?.success, onProcessed, proof.id]);

  useEffect(() => {
    if (rejectState?.success) onProcessed(proof.id, "RECHAZADO");
  }, [rejectState?.success, onProcessed, proof.id]);

  if (approveState?.success || rejectState?.success) return null;

  const remaining = proof.debtTotal - proof.debtPaid;
  const pct = Math.min(100, (proof.debtPaid / proof.debtTotal) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: "var(--brand-rose)" }}
          >
            {proof.customerName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900 truncate">{proof.customerName}</p>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock size={11} />
              {new Date(proof.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
            Pendiente
          </span>
        </div>

        {/* Amount + method */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 p-3 bg-rose-50 rounded-xl">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Monto declarado (cliente)</p>
            <p className="text-lg font-bold text-rose-600">S/ {proof.amount.toFixed(2)}</p>
            <p className="text-xs text-slate-500">{PAYMENT_LABEL[proof.paymentType]}</p>
          </div>
          <div className="flex-1 p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Deuda restante</p>
            <p className="text-base font-bold text-slate-900">S/ {remaining.toFixed(2)}</p>
            <div className="h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full rounded-full bg-rose-400" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Image */}
        <a
          href={proof.imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative rounded-xl overflow-hidden border border-slate-100 hover:border-slate-300 transition-colors group mb-4"
        >
          <img
            src={proof.imageUrl}
            alt="Comprobante"
            className="w-full max-h-56 object-contain bg-slate-50"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
          </div>
        </a>

        {/* Error messages */}
        {approveState?.error && (
          <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg mb-3">{approveState.error}</p>
        )}
        {rejectState?.error && (
          <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg mb-3">{rejectState.error}</p>
        )}

        {/* Actions */}
        {!showRejectForm ? (
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Monto validado por admin (S/)</label>
              <input
                name="validatedAmount"
                type="number"
                min="0.01"
                max={remaining.toFixed(2)}
                step="0.01"
                value={validatedAmount}
                onChange={(e) => setValidatedAmount(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">Saldo máximo a aplicar: S/ {remaining.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
            <form action={approveAction} className="flex-1">
              <input type="hidden" name="proofId" value={proof.id} />
              <input type="hidden" name="validatedAmount" value={validatedAmount} />
              <button
                type="submit"
                disabled={approvePending || rejectPending}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-60"
              >
                {approvePending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                Aprobar y registrar pago
              </button>
            </form>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={approvePending || rejectPending}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-60"
            >
              <XCircle size={15} />
              Rechazar
            </button>
            </div>
          </div>
        ) : (
          <form action={rejectAction} className="space-y-3">
            <input type="hidden" name="proofId" value={proof.id} />
            <textarea
              name="notes"
              rows={2}
              placeholder="Motivo del rechazo (opcional)"
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={rejectPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-60"
              >
                {rejectPending ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                Confirmar rechazo
              </button>
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}

export default function ComprobantesClient({ proofs: initial }: { proofs: ProofRow[] }) {
  const [proofs, setProofs] = useState(initial);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"TODOS" | "PENDIENTE" | "APROBADO" | "RECHAZADO">("TODOS");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "7D" | "30D">("ALL");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);

  function handleProcessed(id: string, status: "APROBADO" | "RECHAZADO") {
    setProofs((prev) =>
      prev.map((proof) =>
        proof.id === id
          ? { ...proof, status, reviewedAt: new Date().toISOString() }
          : proof
      )
    );
  }

  const q = query.trim().toLowerCase();
  const now = Date.now();
  const filtered = proofs.filter((proof) => {
    const statusOk = statusFilter === "TODOS" ? true : proof.status === statusFilter;
    const text = `${proof.customerName} ${proof.paymentType} ${proof.amount}`.toLowerCase();
    const queryOk = q.length === 0 ? true : text.includes(q);
    const createdAt = new Date(proof.createdAt).getTime();
    const dateOk =
      dateFilter === "ALL"
        ? true
        : dateFilter === "TODAY"
          ? new Date(proof.createdAt).toDateString() === new Date().toDateString()
          : dateFilter === "7D"
            ? now - createdAt <= 7 * 24 * 60 * 60 * 1000
            : now - createdAt <= 30 * 24 * 60 * 60 * 1000;
    return statusOk && queryOk && dateOk;
  });

  const pending = filtered.filter((proof) => proof.status === "PENDIENTE");
  const history = filtered.filter((proof) => proof.status !== "PENDIENTE");

  if (proofs.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <FileCheck size={40} className="mx-auto mb-3 text-slate-300" />
        <p className="font-medium text-slate-500">Sin comprobantes todavía</p>
        <p className="text-sm mt-1">Los comprobantes enviados por clientes aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por cliente, método o monto…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-2 focus:ring-[var(--brand-rose)]/20 transition"
            />
          </div>
          <div className="grid grid-cols-2 md:flex gap-2">
            {[
              { value: "TODOS", label: "Todos" },
              { value: "PENDIENTE", label: "Pendientes" },
              { value: "APROBADO", label: "Aprobados" },
              { value: "RECHAZADO", label: "Rechazados" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value as typeof statusFilter)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  statusFilter === option.value
                    ? "border-[var(--brand-rose)] text-[var(--brand-rose)] bg-[var(--brand-rose-light)]"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:flex gap-2">
            {[
              { value: "ALL", label: "Todo" },
              { value: "TODAY", label: "Hoy" },
              { value: "7D", label: "7 días" },
              { value: "30D", label: "30 días" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDateFilter(option.value as typeof dateFilter)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  dateFilter === option.value
                    ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm text-slate-500 mb-4">
          {pending.length} comprobante{pending.length !== 1 ? "s" : ""} pendiente{pending.length !== 1 ? "s" : ""}
        </p>
        {pending.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-400">
            No hay comprobantes pendientes en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {pending.map((proof) => (
                <ProofCard key={proof.id} proof={proof} onProcessed={handleProcessed} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-slate-500 mb-4">
          Historial reciente: {history.length} comprobante{history.length !== 1 ? "s" : ""} procesado{history.length !== 1 ? "s" : ""}
        </p>
        {history.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-400">
            Aún no hay comprobantes aprobados o rechazados.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {history.slice(0, 30).map((proof) => (
                <div key={proof.id} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{proof.customerName}</p>
                    <p className="text-xs text-slate-400">
                      S/ {proof.amount.toFixed(2)} · {PAYMENT_LABEL[proof.paymentType]} · {new Date(proof.createdAt).toLocaleDateString("es-PE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(proof.imageUrl);
                        setPreviewZoom(1);
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Ver comprobante
                    </button>
                    <a
                      href={proof.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Abrir
                    </a>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                      proof.status === "APROBADO"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {proof.status === "APROBADO" ? "Aprobado" : "Rechazado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Vista de comprobante</p>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setPreviewZoom(1);
                  }}
                  className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(1)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    100%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.min(3, z + 0.25))}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-slate-500">{Math.round(previewZoom * 100)}%</p>
              </div>
              <div className="bg-slate-50 p-2 overflow-auto max-h-[76vh]">
                <img
                  src={previewImage}
                  alt="Comprobante"
                  className="w-full object-contain rounded-xl origin-top transition-transform duration-150"
                  style={{ transform: `scale(${previewZoom})` }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
