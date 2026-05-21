import { db } from "@/lib/db";
import NuevoPedidoClient from "./NuevoPedidoClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevoPedidoPage({
  searchParams,
}: {
  searchParams?: Promise<{ customerQuery?: string; productQuery?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const [customers, products] = await Promise.all([
    db.customer.findMany({
      where: { active: true },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: "asc" },
      take: 500,
    }),
    db.product.findMany({
      where: { active: true, stock: { gt: 0 } },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        images: true,
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
      take: 500,
    }),
  ]);

  const prods = products.map((p) => ({ ...p, price: Number(p.price) }));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/admin/pedidos" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={15} />
          Pedidos
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Nuevo pedido</h1>
        <p className="text-sm text-slate-500 mt-0.5">Registra un pedido recibido por WhatsApp u otro medio</p>
      </div>
      <NuevoPedidoClient
        customers={customers}
        products={prods}
        initialCustomerQuery={sp.customerQuery}
        initialProductQuery={sp.productQuery}
      />
    </div>
  );
}
