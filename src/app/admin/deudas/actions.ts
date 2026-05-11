"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { DebtPanelRow } from "@/components/DebtPanel";

export type ActionResult = { success?: true; error?: string } | null;

type PaymentType = "EFECTIVO" | "TRANSFERENCIA" | "CREDITO" | "YAPE" | "PLIN";
type DebtStatus = "PENDIENTE" | "PARCIAL" | "PAGADO" | "VENCIDO" | "CONDONADO";

export type DebtDetail = DebtPanelRow & {
  customerId: string;
  dueDate: string | null;
};

export async function fetchPendingDebts(): Promise<{
  rows: DebtDetail[];
  totalRemaining: number;
  totalInMora: number;
}> {
  const now = new Date();
  const debts = await db.debt.findMany({
    where: { status: { in: ["PENDIENTE", "PARCIAL", "VENCIDO"] } },
    include: {
      customer: { select: { id: true, name: true } },
      _count: { select: { payments: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: DebtDetail[] = debts.map((d: any) => {
    const name = d.customer.name;
    const avatar = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
    const amount = Number(d.amount);
    const amountPaid = Number(d.amountPaid);
    const remaining = amount - amountPaid;
    const daysOverdue =
      d.dueDate && d.dueDate < now
        ? Math.floor((now.getTime() - d.dueDate.getTime()) / 86_400_000)
        : 0;

    return {
      id: d.id,
      customerId: d.customer.id,
      customer: name,
      avatar,
      amount,
      amountPaid,
      remaining,
      status: d.status as DebtDetail["status"],
      daysOverdue,
      paymentsCount: d._count.payments,
      dueDate: d.dueDate?.toISOString() ?? null,
    };
  });

  const totalRemaining = rows.reduce((s, r) => s + r.remaining, 0);
  const totalInMora = rows.filter((r) => r.daysOverdue > 0).reduce((s, r) => s + r.remaining, 0);

  return { rows, totalRemaining, totalInMora };
}

export async function registerPaymentAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const debtId = formData.get("debtId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const paymentType = formData.get("paymentType") as PaymentType;
  const reference = ((formData.get("reference") as string) || "").trim() || undefined;

  if (!debtId || isNaN(amount) || amount <= 0) return { error: "Monto inválido." };
  if (!paymentType) return { error: "Selecciona el método de pago." };

  try {
    const debt = await db.debt.findUnique({
      where: { id: debtId },
      select: { amount: true, amountPaid: true },
    });
    if (!debt) return { error: "Deuda no encontrada." };

    const newAmountPaid = Number(debt.amountPaid) + amount;
    const totalAmount = Number(debt.amount);

    if (amount > totalAmount - Number(debt.amountPaid) + 0.001) {
      return { error: "El monto supera el saldo pendiente." };
    }

    const isPaid = newAmountPaid >= totalAmount - 0.001;
    const newStatus: DebtStatus = isPaid ? "PAGADO" : "PARCIAL";

    await db.$transaction([
      db.debtPayment.create({
        data: { debtId, amount, paymentType, reference },
      }),
      db.debt.update({
        where: { id: debtId },
        data: {
          amountPaid: newAmountPaid,
          status: newStatus,
          ...(isPaid ? { paidAt: new Date() } : {}),
        },
      }),
    ]);

    revalidatePath("/admin/deudas");
    return { success: true };
  } catch {
    return { error: "Error al registrar el pago." };
  }
}
