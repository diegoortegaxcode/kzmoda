"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { revalidatePath } from "next/cache";

export type ActionResult = { success?: true; error?: string } | null;

type DebtStatus = "PENDIENTE" | "PARCIAL" | "PAGADO" | "VENCIDO" | "CONDONADO";

async function getAdminUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get("kmoda_session")?.value;
  if (!token) return null;
  const session = await verifyJWT(token);
  return session?.sub ?? null;
}

export interface ProofRow {
  id: string;
  customerName: string;
  customerId: string;
  debtId: string;
  amount: number;
  paymentType: string;
  imageUrl: string;
  notes: string | null;
  createdAt: string;
  debtTotal: number;
  debtPaid: number;
  debtStatus: string;
  status: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  reviewedAt: string | null;
}

export async function fetchProofs(): Promise<ProofRow[]> {
  const proofs = await db.paymentProof.findMany({
    include: {
      customer: { select: { id: true, name: true } },
      debt: { select: { id: true, amount: true, amountPaid: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  return proofs.map((p) => ({
    id: p.id,
    customerName: p.customer.name,
    customerId: p.customer.id,
    debtId: p.debt.id,
    amount: Number(p.amount),
    paymentType: p.paymentType,
    imageUrl: p.imageUrl,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
    debtTotal: Number(p.debt.amount),
    debtPaid: Number(p.debt.amountPaid),
    debtStatus: p.debt.status,
    status: p.status,
    reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString() : null,
  }));
}

export async function approveProofAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const reviewerId = await getAdminUserId();
  if (!reviewerId) return { error: "Sin autorización." };

  const proofId = formData.get("proofId") as string;
  const validatedRaw = formData.get("validatedAmount") as string | null;
  if (!proofId) return { error: "ID de comprobante requerido." };

  const proof = await db.paymentProof.findUnique({
    where: { id: proofId },
    include: { debt: { select: { id: true, amount: true, amountPaid: true } } },
  });

  if (!proof || proof.status !== "PENDIENTE") return { error: "Comprobante no válido o ya procesado." };

  const remaining = Number(proof.debt.amount) - Number(proof.debt.amountPaid);
  const parsedValidated = validatedRaw ? Number.parseFloat(validatedRaw) : Number(proof.amount);
  if (!Number.isFinite(parsedValidated) || parsedValidated <= 0) {
    return { error: "Ingresa un monto validado mayor a 0." };
  }
  if (parsedValidated > remaining + 0.001) {
    return { error: `El monto validado supera el saldo pendiente (S/ ${remaining.toFixed(2)}).` };
  }

  const declaredAmount = Number(proof.amount);
  const validatedAmount = parsedValidated;
  const reviewNote =
    declaredAmount === validatedAmount
      ? `Monto declarado y validado: S/ ${validatedAmount.toFixed(2)}`
      : `Monto declarado: S/ ${declaredAmount.toFixed(2)} · validado por admin: S/ ${validatedAmount.toFixed(2)}`;

  const newAmountPaid = Number(proof.debt.amountPaid) + validatedAmount;
  const totalAmount = Number(proof.debt.amount);
  const isPaid = newAmountPaid >= totalAmount - 0.001;
  const newStatus: DebtStatus = isPaid ? "PAGADO" : "PARCIAL";

  try {
    await db.$transaction([
      db.paymentProof.update({
        where: { id: proofId },
        data: {
          status: "APROBADO",
          reviewedAt: new Date(),
          reviewedBy: reviewerId,
          notes: reviewNote,
        },
      }),
      db.debtPayment.create({
        data: {
          debtId: proof.debtId,
          amount: validatedAmount,
          paymentType: proof.paymentType,
          reference: `Comprobante #${proofId.slice(-6)}`,
        },
      }),
      db.debt.update({
        where: { id: proof.debtId },
        data: {
          amountPaid: newAmountPaid,
          status: newStatus,
          ...(isPaid ? { paidAt: new Date() } : {}),
        },
      }),
    ]);

    revalidatePath("/admin/comprobantes");
    revalidatePath("/admin/deudas");
    return { success: true };
  } catch {
    return { error: "Error al procesar el pago." };
  }
}

export async function rejectProofAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const reviewerId = await getAdminUserId();
  if (!reviewerId) return { error: "Sin autorización." };

  const proofId = formData.get("proofId") as string;
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  if (!proofId) return { error: "ID de comprobante requerido." };

  const proof = await db.paymentProof.findUnique({ where: { id: proofId } });
  if (!proof || proof.status !== "PENDIENTE") return { error: "Comprobante no válido o ya procesado." };

  try {
    await db.paymentProof.update({
      where: { id: proofId },
      data: { status: "RECHAZADO", notes, reviewedAt: new Date(), reviewedBy: reviewerId },
    });

    revalidatePath("/admin/comprobantes");
    return { success: true };
  } catch {
    return { error: "Error al rechazar el comprobante." };
  }
}
