import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, User, CreditCard, FileText, CheckCircle2, Pencil } from "lucide-react";
import clsx from "clsx";
import OrderStatusSelect from "../OrderStatusSelect";

export const dynamic = "force-dynamic";

const PAYMENT_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia",
  YAPE: "Yape", PLIN: "Plin", CREDITO: "Crédito",
};

const DEBT_STATUS: Record<string, { label: string; cls: string }> = {
  PENDIENTE:  { label: "Pendiente",  cls: "bg-amber-50 text-amber-700 border-amber-200"     },
  PARCIAL:    { label: "Parcial",    cls: "bg-blue-50 text-blue-700 border-blue-200"         },
  PAGADO:     { label: "Pagado",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200"},
  VENCIDO:    { label: "Vencido",    cls: "bg-rose-50 text-rose-700 border-rose-200"         },
  CONDONADO:  { label: "Condonado",  cls: "bg-slate-100 text-slate-500 border-slate-200"    },
};

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true, phone: true, dni: true } },
      user: { select: { name: true } },
      items: {
        include: {
          product: {
            select: { name: true, sku: true, images: true, category: { select: { name: true } } },
          },
        },
        orderBy: { subtotal: "desc" },
      },
      debt: {
        include: {
          payments: { orderBy: { paidAt: "desc" }, take: 10 },
        },
      },
    },
  });

  if (!order) notFound();

  const debtStatus = order.debt ? DEBT_STATUS[order.debt.status] ?? DEBT_STATUS.PENDIENTE : null;
  const debtPct = order.debt
    ? Math.min(100, (Number(order.debt.amountPaid) / Number(order.debt.amount)) * 100)
    : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/pedidos"
          className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold text-slate-900">Pedido</h1>
            <span className="text-xs font-mono text-slate-400">#{order.id.slice(-8).toUpperCase()}</span>
            <OrderStatusSelect
              orderId={order.id}
              current={order.status as "PENDIENTE" | "EN_PROCESO" | "EN_DESPACHO" | "COMPLETADO" | "CANCELADO"}
            />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Creado el {new Date(order.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}
            {" · "}Por {order.user.name}
          </p>
        </div>
        <Link
          href={`/admin/pedidos/${order.id}/editar`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Pencil size={13} />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Package size={14} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Productos</h2>
              <span className="text-xs text-slate-400 ml-auto">{order.items.length} {order.items.length === 1 ? "ítem" : "ítems"}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Package size={18} className="text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{item.product.sku}</p>
                    <p className="text-[10px] text-slate-400">{item.product.category.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">
                      {item.qty} × S/ {Number(item.unitPrice).toFixed(2)}
                    </p>
                    <p className="text-sm font-bold text-slate-900">S/ {Number(item.subtotal).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 px-5 py-4 space-y-1.5 bg-slate-50">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>S/ {Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Descuento</span>
                  <span>-S/ {Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total</span>
                <span>S/ {Number(order.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Forma de pago</span>
                <span className="font-semibold">{PAYMENT_LABEL[order.paymentType]}</span>
              </div>
            </div>
          </div>

          {/* Debt payments history */}
          {order.debt && order.debt.payments.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <h2 className="text-sm font-semibold text-slate-900">Historial de pagos</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {order.debt.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{PAYMENT_LABEL[p.paymentType]}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(p.paidAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                        {p.reference && ` · ${p.reference}`}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">+S/ {Number(p.amount).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Notas</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <User size={14} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Cliente</h2>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-slate-900">{order.customer.name}</p>
              {order.customer.email && (
                <p className="text-xs text-slate-500">{order.customer.email}</p>
              )}
              {order.customer.phone && (
                <p className="text-xs text-slate-500">{order.customer.phone}</p>
              )}
              {order.customer.dni && (
                <p className="text-xs font-mono text-slate-400">{order.customer.dni}</p>
              )}
            </div>
          </div>

          {/* Debt summary */}
          {order.debt && debtStatus && debtPct !== null && (
            <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={14} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Crédito</h2>
                <span className={clsx("ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border", debtStatus.cls)}>
                  {debtStatus.label}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total deuda</span>
                  <span className="font-semibold text-slate-900">S/ {Number(order.debt.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Pagado</span>
                  <span className="font-semibold text-emerald-600">S/ {Number(order.debt.amountPaid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Pendiente</span>
                  <span className="font-bold text-rose-600">
                    S/ {(Number(order.debt.amount) - Number(order.debt.amountPaid)).toFixed(2)}
                  </span>
                </div>

                <div className="pt-1">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${debtPct}%`,
                        background: debtPct >= 100 ? "#10B981" : "var(--brand-rose)",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{debtPct.toFixed(0)}% pagado</p>
                </div>

                {order.debt.dueDate && (
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-400">Vencimiento</span>
                    <span className={clsx("font-semibold", new Date(order.debt.dueDate) < new Date() ? "text-rose-600" : "text-slate-700")}>
                      {new Date(order.debt.dueDate).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
