"use server";

import { db } from "@/lib/db";
import { uploadToS3 } from "@/lib/s3";
import { getCustomerSession } from "@/lib/customer-auth";
import { revalidatePath } from "next/cache";

export type ProofResult = { success?: true; error?: string } | null;

export async function submitProofAction(_prev: ProofResult, formData: FormData): Promise<ProofResult> {
  const session = await getCustomerSession();
  if (!session) return { error: "Sesión expirada. Vuelve a iniciar sesión." };

  const debtId = formData.get("debtId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const paymentType = (formData.get("paymentType") as string) || "TRANSFERENCIA";
  const file = formData.get("image") as File | null;

  if (!debtId || isNaN(amount) || amount <= 0) return { error: "Monto inválido." };
  if (!file || file.size === 0) return { error: "Adjunta una imagen del comprobante." };
  if (file.size > 8 * 1024 * 1024) return { error: "La imagen no debe superar 8 MB." };
  if (!file.type.startsWith("image/")) return { error: "Solo se aceptan imágenes (JPG, PNG, WEBP)." };

  const debt = await db.debt.findUnique({
    where: { id: debtId },
    select: { customerId: true, amount: true, amountPaid: true, status: true },
  });

  if (!debt) return { error: "Deuda no encontrada." };
  if (debt.customerId !== session.sub) return { error: "No tienes permiso para esta deuda." };
  if (debt.status === "PAGADO" || debt.status === "CONDONADO") return { error: "Esta deuda ya está saldada." };

  const remaining = Number(debt.amount) - Number(debt.amountPaid);
  if (amount > remaining + 0.01) return { error: `El monto supera el saldo pendiente (S/ ${remaining.toFixed(2)}).` };

  const pendingProof = await db.paymentProof.findFirst({
    where: { debtId, status: "PENDIENTE" },
  });
  if (pendingProof) return { error: "Ya tienes un comprobante en revisión para esta deuda." };

  try {
    const imageUrl = await uploadToS3(file);

    await db.paymentProof.create({
      data: {
        debtId,
        customerId: session.sub,
        imageUrl,
        amount,
        paymentType: paymentType as "TRANSFERENCIA" | "YAPE" | "PLIN" | "EFECTIVO" | "CREDITO",
        status: "PENDIENTE",
      },
    });

    revalidatePath(`/cuenta/deudas/${debtId}`);
    revalidatePath("/cuenta/pedidos");
    return { success: true };
  } catch {
    return { error: "Error al subir el comprobante. Intenta de nuevo." };
  }
}
