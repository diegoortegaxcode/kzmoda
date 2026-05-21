import { getCustomerSession } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import UploadProofForm from "./UploadProofForm";
import { Package, CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Parcial",
  PAGADO: "Pagado",
  VENCIDO: "Vencido",
  CONDONADO: "Condonado",
};

const STATUS_STYLE: Record<string, string> = {
  PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200",
  PARCIAL: "bg-blue-50 text-blue-700 border-blue-200",
  PAGADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  VENCIDO: "bg-rose-50 text-rose-700 border-rose-200",
  CONDONADO: "bg-slate-50 text-slate-600 border-slate-200",
};

const PROOF_ICON: Record<string, React.ElementType> = {
  PENDIENTE: Clock,
  APROBADO: CheckCircle2,
  RECHAZADO: XCircle,
};

const PROOF_STYLE: Record<string, string> = {
  PENDIENTE: "text-amber-600 bg-amber-50 border-amber-200",
  APROBADO: "text-emerald-600 bg-emerald-50 border-emerald-200",
  RECHAZADO: "text-rose-600 bg-rose-50 border-rose-200",
};

const PAYMENT_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  YAPE: "Yape",
  PLIN: "Plin",
  CREDITO: "Crédito",
};

export default async function DeudaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession();
  if (!session) redirect("/cuenta/login");

  const { id } = await params;

  const debt = await db.debt.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: { include: { product: { select: { name: true, images: true, sku: true } } } },
        },
      },
      payments: { orderBy: { paidAt: "desc" } },
      paymentProofs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!debt || debt.customerId !== session.sub) notFound();

  const remaining = Number(debt.amount) - Number(debt.amountPaid);
  const pct = Math.min(100, (Number(debt.amountPaid) / Number(debt.amount)) * 100);
  const hasPendingProof = debt.paymentProofs.some((p) => p.status === "PENDIENTE");
  const canUpload = debt.status !== "PAGADO" && debt.status !== "CONDONADO" && !hasPendingProof;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/cuenta/pedidos" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={15} />
          Mis pedidos
        </Link>
      </div>

      {/* Debt summary */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>
              Detalle de deuda
            </h1>
            {debt.dueDate && (
              <p className="text-sm text-slate-400 mt-0.5">
                Vence: {new Date(debt.dueDate).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[debt.status]}`}>
            {STATUS_LABEL[debt.status]}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Total</p>
            <p className="text-base font-bold text-slate-900">S/ {Number(debt.amount).toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Pagado</p>
            <p className="text-base font-bold text-emerald-700">S/ {Number(debt.amountPaid).toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-rose-50 rounded-xl">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Pendiente</p>
            <p className="text-base font-bold text-rose-600">S/ {remaining.toFixed(2)}</p>
          </div>
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: pct >= 100 ? "#10B981" : "var(--brand-rose)" }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-right">{pct.toFixed(0)}% pagado</p>
      </div>

      {/* Products */}
      {debt.order && debt.order.items.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Productos del pedido</h2>
          <div className="space-y-3">
            {debt.order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product.images[0] ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Package size={16} className="text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400">{item.qty} × S/ {Number(item.unitPrice).toFixed(2)}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">S/ {Number(item.subtotal).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment history */}
      {debt.payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Pagos registrados</h2>
          <div className="space-y-2">
            {debt.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">S/ {Number(p.amount).toFixed(2)}</p>
                  <p className="text-xs text-slate-400">
                    {PAYMENT_LABEL[p.paymentType]} · {new Date(p.paidAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Aprobado</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof history */}
      {debt.paymentProofs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Comprobantes enviados</h2>
          <div className="space-y-3">
            {debt.paymentProofs.map((proof) => {
              const Icon = PROOF_ICON[proof.status];
              return (
                <div key={proof.id} className={`flex items-center gap-3 p-3 rounded-xl border ${PROOF_STYLE[proof.status]}`}>
                  <Icon size={16} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">S/ {Number(proof.amount).toFixed(2)} — {PAYMENT_LABEL[proof.paymentType]}</p>
                    <p className="text-[11px] opacity-70">Monto declarado por cliente</p>
                    <p className="text-[11px] opacity-70">
                      {new Date(proof.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    {proof.notes && <p className="text-xs mt-1 opacity-80">{proof.notes}</p>}
                  </div>
                  <a href={proof.imageUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] underline opacity-70 hover:opacity-100 shrink-0">
                    Ver imagen
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload form */}
      {canUpload && <UploadProofForm debtId={debt.id} maxAmount={remaining} />}

      {hasPendingProof && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
          <Clock size={20} className="mx-auto text-amber-500 mb-2" />
          <p className="text-sm font-semibold text-amber-800">Comprobante en revisión</p>
          <p className="text-xs text-amber-600 mt-1">El administrador validará el monto y luego aplicará el pago a tu deuda.</p>
        </div>
      )}

      {(debt.status === "PAGADO" || debt.status === "CONDONADO") && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <CheckCircle2 size={20} className="mx-auto text-emerald-500 mb-2" />
          <p className="text-sm font-semibold text-emerald-800">¡Deuda saldada!</p>
          <p className="text-xs text-emerald-600 mt-1">Esta deuda ha sido completamente pagada.</p>
        </div>
      )}
    </div>
  );
}
