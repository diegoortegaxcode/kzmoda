import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditarPedidoClient from "./EditarPedidoClient";

export const dynamic = "force-dynamic";

export default async function EditarPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [order, products] = await Promise.all([
    db.order.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true } },
        items: {
          include: {
            product: {
              select: { name: true, sku: true, images: true, stock: true, category: { select: { name: true } } },
            },
          },
        },
        debt: { select: { id: true, amountPaid: true, dueDate: true } },
      },
    }),
    db.product.findMany({
      where: { active: true },
      select: { id: true, name: true, sku: true, price: true, stock: true, images: true, category: { select: { name: true } } },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  if (!order) notFound();

  const initialItems = order.items.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    sku: item.product.sku,
    qty: item.qty,
    unitPrice: Number(item.unitPrice),
    // Show current DB stock (action restores old qty before validating new)
    stock: item.product.stock,
    image: item.product.images[0] ?? null,
  }));

  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
    stock: p.stock,
    images: p.images,
    category: { name: p.category.name },
  }));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/admin/pedidos/${id}`}
          className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
        >
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-base font-bold text-slate-900">Editar pedido</h1>
          <p className="text-xs text-slate-400">
            #{id.slice(-8).toUpperCase()} · {order.customer.name}
          </p>
        </div>
      </div>

      <EditarPedidoClient
        orderId={id}
        customerName={order.customer.name}
        initialItems={initialItems}
        initialDiscount={Number(order.discount)}
        initialPaymentType={order.paymentType}
        initialNotes={order.notes ?? ""}
        initialDueDate={order.debt?.dueDate ? order.debt.dueDate.toISOString().split("T")[0] : ""}
        hasDebt={!!order.debt}
        amountPaid={order.debt ? Number(order.debt.amountPaid) : 0}
        products={serializedProducts}
      />
    </div>
  );
}
