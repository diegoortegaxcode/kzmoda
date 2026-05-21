import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import PedidosClient, { type OrderListItem } from "./PedidosClient";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const raw = await db.order.findMany({
    include: {
      customer: { select: { name: true } },
      _count: { select: { items: true } },
      debt: { select: { status: true, amountPaid: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const orders: OrderListItem[] = raw.map((o) => ({
    id: o.id,
    customerName: o.customer.name,
    status: o.status as OrderListItem["status"],
    paymentType: o.paymentType,
    total: Number(o.total),
    discount: Number(o.discount),
    createdAt: new Date(o.createdAt).toLocaleDateString("es-PE", {
      day: "2-digit", month: "short", year: "numeric",
    }),
    itemsCount: o._count.items,
    debt: o.debt
      ? { status: o.debt.status, amountPaid: Number(o.debt.amountPaid), amount: Number(o.debt.amount) }
      : null,
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pedidos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {orders.length} pedido{orders.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Link
          href="/admin/pedidos/nuevo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0"
          style={{ background: "linear-gradient(135deg, var(--brand-rose), var(--brand-rose-dark))" }}
        >
          <Plus size={16} />
          Nuevo pedido
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <ShoppingBag size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Sin pedidos todavía</p>
          <p className="text-sm mt-1">Crea el primer pedido con el botón de arriba</p>
        </div>
      ) : (
        <PedidosClient orders={orders} />
      )}
    </div>
  );
}
