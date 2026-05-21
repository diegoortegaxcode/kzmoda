import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { db } from "@/lib/db";

type AdminNotification = {
  id: string;
  kind: "DEBT_DUE" | "LOW_STOCK" | "PROOF_PENDING";
  title: string;
  description: string;
  href: string;
  createdAt: string;
  severity: "high" | "medium";
  read: boolean;
};

async function getAdminSession() {
  const store = await cookies();
  const token = store.get("kmoda_session")?.value;
  const session = token ? await verifyJWT(token) : null;
  return session && session.role !== "CLIENTE" ? session : null;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const now = new Date();
  const [overdueDebts, lowStockProducts, pendingProofs] = await Promise.all([
    db.debt.findMany({
      where: { status: { in: ["PENDIENTE", "PARCIAL", "VENCIDO"] }, dueDate: { lt: now } },
      include: { customer: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
    db.product.findMany({
      where: { active: true, stock: { lte: 3 } },
      select: { id: true, name: true, stock: true, updatedAt: true },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    db.paymentProof.findMany({
      where: { status: "PENDIENTE" },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
      take: 8,
    }),
  ]);

  const baseNotifications = [
    ...overdueDebts.map((debt) => ({
      id: `debt-${debt.id}`,
      kind: "DEBT_DUE" as const,
      title: "Deuda vencida",
      description: `${debt.customer.name} tiene saldo pendiente de S/ ${(Number(debt.amount) - Number(debt.amountPaid)).toFixed(2)}`,
      href: "/admin/deudas",
      createdAt: (debt.dueDate ?? debt.createdAt).toISOString(),
      severity: "high" as const,
    })),
    ...lowStockProducts.map((product) => ({
      id: `stock-${product.id}`,
      kind: "LOW_STOCK" as const,
      title: "Stock crítico",
      description: `${product.name} con ${product.stock} unidades`,
      href: "/admin/inventario",
      createdAt: product.updatedAt.toISOString(),
      severity: "medium" as const,
    })),
    ...pendingProofs.map((proof) => ({
      id: `proof-${proof.id}`,
      kind: "PROOF_PENDING" as const,
      title: "Comprobante pendiente",
      description: `${proof.customer.name} envió S/ ${Number(proof.amount).toFixed(2)} para revisión`,
      href: "/admin/comprobantes",
      createdAt: proof.createdAt.toISOString(),
      severity: "medium" as const,
    })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 20);

  const reads = await db.notificationRead.findMany({
    where: {
      userId: session.sub,
      notificationId: { in: baseNotifications.map((item) => item.id) },
    },
    select: { notificationId: true },
  });
  const readSet = new Set(reads.map((row) => row.notificationId));

  const notifications: AdminNotification[] = baseNotifications.map((item) => ({
    ...item,
    read: readSet.has(item.id),
  }));

  return NextResponse.json({ notifications });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: {
    action?: "read_one" | "read_many" | "unread_one";
    notificationId?: string;
    notificationIds?: string[];
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (body.action === "read_one") {
    if (!body.notificationId) return NextResponse.json({ error: "notification_required" }, { status: 400 });
    await db.notificationRead.upsert({
      where: { userId_notificationId: { userId: session.sub, notificationId: body.notificationId } },
      create: { userId: session.sub, notificationId: body.notificationId },
      update: { readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  }

  if (body.action === "read_many") {
    const ids = (body.notificationIds ?? []).filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ success: true });
    await db.notificationRead.createMany({
      data: ids.map((notificationId) => ({ userId: session.sub, notificationId })),
      skipDuplicates: true,
    });
    return NextResponse.json({ success: true });
  }

  if (body.action === "unread_one") {
    if (!body.notificationId) return NextResponse.json({ error: "notification_required" }, { status: 400 });
    await db.notificationRead.deleteMany({
      where: { userId: session.sub, notificationId: body.notificationId },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "invalid_action" }, { status: 400 });
}
