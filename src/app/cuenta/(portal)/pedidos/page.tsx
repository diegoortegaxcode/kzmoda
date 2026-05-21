import { getCustomerSession } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ChevronRight, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

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

const PROOF_STYLE: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  PENDIENTE: { label: "Comprobante en revisión", cls: "text-amber-600 bg-amber-50", icon: Clock },
  APROBADO: { label: "Pago aprobado", cls: "text-emerald-600 bg-emerald-50", icon: CheckCircle2 },
  RECHAZADO: { label: "Comprobante rechazado", cls: "text-rose-600 bg-rose-50", icon: XCircle },
};

export default async function PedidosPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/cuenta/login");

  const debts = await db.debt.findMany({
    where: { customerId: session.sub },
    include: {
      order: {
        include: {
          items: {
            include: { product: { select: { name: true, images: true } } },
            take: 3,
          },
        },
      },
      paymentProofs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (debts.length === 0) {
    return (
      <div className="text-center py-20">
        <Package size={40} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">No tienes deudas activas</p>
        <p className="text-sm text-slate-400 mt-1">Aquí aparecerán tus pedidos con crédito</p>
        <Link href="/" className="inline-block mt-4 text-sm text-rose-500 font-semibold hover:text-rose-600">
          Ver catálogo →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-playfair)" }}>
          Mis pedidos
        </h1>
        <span className="text-sm text-slate-400">{debts.length} {debts.length === 1 ? "pedido" : "pedidos"}</span>
      </div>

      {debts.map((debt) => {
        const remaining = Number(debt.amount) - Number(debt.amountPaid);
        const pct = Math.min(100, (Number(debt.amountPaid) / Number(debt.amount)) * 100);
        const lastProof = debt.paymentProofs[0];
        const ProofIcon = lastProof ? PROOF_STYLE[lastProof.status]?.icon : null;

        return (
          <Link key={debt.id} href={`/cuenta/deudas/${debt.id}`}>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-rose-200 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span
                    className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[debt.status]}`}
                  >
                    {STATUS_LABEL[debt.status]}
                  </span>
                  {debt.dueDate && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Vence: {new Date(debt.dueDate).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-rose-400 transition-colors mt-0.5 shrink-0" />
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Pagado: <strong className="text-slate-900">S/ {Number(debt.amountPaid).toFixed(2)}</strong></span>
                  <span>Total: <strong className="text-slate-900">S/ {Number(debt.amount).toFixed(2)}</strong></span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: pct >= 100 ? "#10B981" : "var(--brand-rose)" }}
                  />
                </div>
                {debt.status !== "PAGADO" && (
                  <p className="text-xs text-slate-500 mt-1">
                    Pendiente: <strong className="text-rose-600">S/ {remaining.toFixed(2)}</strong>
                  </p>
                )}
              </div>

              {/* Products preview */}
              {debt.order && debt.order.items.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {debt.order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-1.5">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package size={14} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  {debt.order.items.length > 3 && (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500">
                      +{debt.order.items.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Last proof status */}
              {lastProof && ProofIcon && (
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg w-fit ${PROOF_STYLE[lastProof.status].cls}`}>
                  <ProofIcon size={13} />
                  {PROOF_STYLE[lastProof.status].label}
                </div>
              )}

              {debt.status !== "PAGADO" && debt.status !== "CONDONADO" && !lastProof && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                  <AlertCircle size={13} />
                  Sube tu comprobante para registrar un pago
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
