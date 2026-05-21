import { db } from "@/lib/db";
import { Package, Users, CreditCard, ShoppingBag } from "lucide-react";
import KPICard from "@/components/KPICard";
import RecentOrders, { type RecentOrderRow } from "@/components/RecentOrders";
import StockAlerts, { type LowStockItem } from "@/components/StockAlerts";
import DashboardHeader from "@/components/DashboardHeader";
import CatalogCTA from "@/components/CatalogCTA";
import DebtPanel, { type DebtPanelRow } from "@/components/DebtPanel";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    productCount,
    prevProductCount,
    customerCount,
    prevCustomerCount,
    debtAgg,
    prevDebtAgg,
    thisMonthOrders,
    prevMonthOrders,
    rawOrders,
    allProducts,
    rawDebts,
  ] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.product.count({ where: { active: true, createdAt: { lt: thisMonthStart } } }),
    db.customer.count({ where: { active: true } }),
    db.customer.count({ where: { active: true, createdAt: { lt: thisMonthStart } } }),
    db.debt.aggregate({
      _sum: { amount: true, amountPaid: true },
      where: { status: { in: ["PENDIENTE", "PARCIAL", "VENCIDO"] } },
    }),
    db.debt.aggregate({
      _sum: { amount: true, amountPaid: true },
      where: {
        status: { in: ["PENDIENTE", "PARCIAL", "VENCIDO"] },
        createdAt: { lt: thisMonthStart },
      },
    }),
    db.order.count({ where: { createdAt: { gte: thisMonthStart } } }),
    db.order.count({ where: { createdAt: { gte: prevMonthStart, lt: thisMonthStart } } }),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        items: { take: 1, include: { product: { select: { name: true } } }, orderBy: { subtotal: "desc" } },
        _count: { select: { items: true } },
      },
    }),
    db.product.findMany({
      where: { active: true },
      select: { id: true, name: true, stock: true, minStock: true, category: { select: { name: true } } },
      orderBy: { stock: "asc" },
    }),
    db.debt.findMany({
      where: { status: { in: ["PENDIENTE", "PARCIAL", "VENCIDO"] } },
      include: {
        customer: { select: { name: true } },
        _count: { select: { payments: true } },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      take: 20,
    }),
  ]);

  const pendingDebt = Number(debtAgg._sum.amount ?? 0) - Number(debtAgg._sum.amountPaid ?? 0);
  const prevPendingDebt = Number(prevDebtAgg._sum.amount ?? 0) - Number(prevDebtAgg._sum.amountPaid ?? 0);

  const productTrend = prevProductCount === 0 ? 100 : Math.round(((productCount - prevProductCount) / prevProductCount) * 100);
  const customerTrend = prevCustomerCount === 0 ? 100 : Math.round(((customerCount - prevCustomerCount) / prevCustomerCount) * 100);
  const debtTrend = prevPendingDebt === 0 ? 0 : Math.round(((pendingDebt - prevPendingDebt) / prevPendingDebt) * 100);
  const orderTrend = prevMonthOrders === 0 ? 100 : Math.round(((thisMonthOrders - prevMonthOrders) / prevMonthOrders) * 100);

  const prevMonthName = prevMonthStart.toLocaleDateString("es-PE", { month: "long", year: "numeric" });

  const kpis = [
    {
      title: "Productos activos",
      value: productCount,
      trend: productTrend,
      trendLabel: `vs. mes anterior`,
      icon: <Package size={20} strokeWidth={2} />,
      color: "indigo" as const,
    },
    {
      title: "Clientes registrados",
      value: customerCount,
      trend: customerTrend,
      trendLabel: `vs. mes anterior`,
      icon: <Users size={20} strokeWidth={2} />,
      color: "emerald" as const,
    },
    {
      title: "Deudas pendientes",
      value: Math.round(pendingDebt),
      prefix: "S/ ",
      trend: -debtTrend,
      trendLabel: "vs. mes anterior",
      icon: <CreditCard size={20} strokeWidth={2} />,
      color: "rose" as const,
    },
    {
      title: "Pedidos del mes",
      value: thisMonthOrders,
      trend: orderTrend,
      trendLabel: `vs. ${prevMonthName}`,
      icon: <ShoppingBag size={20} strokeWidth={2} />,
      color: "amber" as const,
    },
  ];

  const recentOrders: RecentOrderRow[] = rawOrders.map((o) => {
    const nameParts = o.customer.name.trim().split(" ");
    const initials = nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : nameParts[0].slice(0, 2).toUpperCase();
    const firstItem = o.items[0];
    return {
      id: o.id,
      shortId: `#${o.id.slice(-6).toUpperCase()}`,
      customerName: o.customer.name,
      customerInitials: initials,
      productName: firstItem?.product.name ?? "—",
      productQty: o._count.items,
      total: Number(o.total),
      status: o.status,
      createdAt: new Date(o.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
    };
  });

  const today = new Date();
  const debtRows: DebtPanelRow[] = rawDebts.map((d) => {
    const nameParts = d.customer.name.trim().split(" ");
    const avatar = nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : nameParts[0].slice(0, 2).toUpperCase();
    const remaining = Number(d.amount) - Number(d.amountPaid);
    const daysOverdue = d.dueDate && d.dueDate < today
      ? Math.floor((today.getTime() - d.dueDate.getTime()) / 86_400_000)
      : 0;
    return {
      id: d.id,
      customer: d.customer.name,
      avatar,
      amount: Number(d.amount),
      amountPaid: Number(d.amountPaid),
      remaining,
      status: d.status as DebtPanelRow["status"],
      daysOverdue,
      paymentsCount: d._count.payments,
    };
  });

  const lowStock: LowStockItem[] = allProducts
    .filter((p) => p.stock < p.minStock)
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category.name,
      stock: p.stock,
      minStock: p.minStock,
    }));

  return (
    <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      <DashboardHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <RecentOrders orders={recentOrders} />
        </div>
        <StockAlerts items={lowStock} />
      </div>

      <DebtPanel debts={debtRows} />

      <CatalogCTA productCount={productCount} />

      <div className="pb-4" />
    </main>
  );
}
